<?php

namespace App\Controller;

use App\DTO\CreateUserDTO;
use App\Entity\User;
use App\Security\EmailVerifier;
use Doctrine\ORM\EntityManagerInterface;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Mime\Address;
use Symfony\Component\Notifier\NotifierInterface;
use Symfony\Component\Notifier\Recipient\Recipient;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\LoginLink\LoginLinkHandlerInterface;
use Symfony\Component\Security\Http\LoginLink\LoginLinkNotification;
use SymfonyCasts\Bundle\VerifyEmail\Exception\VerifyEmailExceptionInterface;

#[Route(path: "/auth", name: "auth.")]
final class SecurityController extends AbstractController
{
    public function __construct(private readonly EntityManagerInterface $entityManager, private readonly EmailVerifier $emailVerifier)
    {
    }

    #[Route(path: "/register", name: "register", methods: ["POST"])]
    public function register(
        #[MapRequestPayload] CreateUserDTO $userDTO,
        Security                           $security,
    ): Response
    {
        if ($this->entityManager->getRepository(User::class)->findOneBy(['email' => $userDTO->email])) {
            return $this->json([
                "violations" => [
                    [
                        "propertyPath" => "email",
                        "title" => "The email {$userDTO->email} is already in use by another account."
                    ]
                ]
            ], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->persist((new User())
            ->setEmail($userDTO->email)
            ->setName($userDTO->name)
        );
        $this->entityManager->flush();

        $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $userDTO->email]);

        $this->emailVerifier->sendEmailConfirmation("auth.verify_email", $user, (new TemplatedEmail)
            ->to(new Address($user->getEmail(), $user->getName()))
            ->subject("Registration Confirmation to BlitzTask!")
            ->htmlTemplate("auth/registration_email.html.twig")
        );

        $this->addFlash("success", "Please check your email to verify your account.");
        return $security->login($user);
    }

    #[Route(path: "/login", name: "login")]
    public function login(
        Request                   $request,
        LoginLinkHandlerInterface $loginLinkHandler,
        NotifierInterface         $notifier
    ): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);

        if ($user) {
            $loginLinkDetails = $loginLinkHandler->createLoginLink($user);
            $notification = new LoginLinkNotification(
                $loginLinkDetails,
                "Sign In to BlitzTask!"
            );
            $recipient = new Recipient($user->getEmail());
            $notifier->send($notification, $recipient);
        }

        $this->addFlash("success", "A login link has been sent to your email address.");
        return $this->json(['status' => 'success'], Response::HTTP_OK);
    }

    #[Route('/login-check', name: 'login_check')]
    public function check(
        #[Autowire("%env(CLIENT_URL)%")] string $clientUrl,
        Request                                 $request
    ): RedirectResponse
    {
        $separator = parse_url($clientUrl, PHP_URL_QUERY) ? '&' : '?';
        return $this->redirect($clientUrl . "/auth/login_check" . $separator .
            http_build_query([
                "expires" => $request->query->get("expires"),
                "user" => $request->query->get("user"),
                "hash" => $request->query->get("hash"),
            ])
        );
    }

    #[Route('/verify/email', name: 'verify_email')]
    public function verifyUserEmail(Request $request, #[Autowire('%env(CLIENT_URL)%')] string $domain): RedirectResponse
    {
        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');

        try {
            /** @var User $user */
            $user = $this->getUser();
            $this->emailVerifier->handleEmailConfirmation($request, $user);
        } catch (VerifyEmailExceptionInterface $exception) {
            $this->addFlash('error', $exception->getMessage());
            return $this->redirect("$domain/auth/register");
        }

        $this->addFlash('success', 'Your email has been successfully verified.');
        return $this->redirect($domain);
    }

    #[Route("/connect/{service}")]
    public function connect(
        ClientRegistry                          $clientRegistry,
        string                                  $service,
        #[Autowire('%env(CLIENT_URL)%')] string $clientUrl
    ): RedirectResponse
    {
        if ($service === "github") {
            $scopes = ["user:email", "read:user"];
            $client = $clientRegistry->getClient($service);
            return $client->redirect($scopes);
        }

        return $this->redirect("$clientUrl/auth/login");
    }

}
