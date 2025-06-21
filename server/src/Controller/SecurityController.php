<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use App\Event\LoginAttemptEvent;
use App\Event\UserCreatedEvent;
use App\Security\EmailVerifier;
use Doctrine\ORM\EntityManagerInterface;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use SymfonyCasts\Bundle\VerifyEmail\Exception\VerifyEmailExceptionInterface;

#[Route(path: "/auth", name: "auth.")]
final class SecurityController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface   $entityManager,
        private readonly EmailVerifier            $emailVerifier,
        private readonly EventDispatcherInterface $eventDispatcher
    )
    {
    }

    #[Route(path: "/register", name: "register", methods: ["POST"])]
    public function register(
        #[MapRequestPayload] User $user,
        Security                  $security,
    ): Response
    {
        if ($this->entityManager->getRepository(User::class)->findOneBy(['email' => $user->getEmail()])) {
            return $this->json([
                "violations" => [
                    [
                        "propertyPath" => "email",
                        "title" => "The email {$user->getEmail()} is already in use by another account."
                    ]
                ]
            ], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->persist($user);
        $this->entityManager->flush();
        $this->entityManager->refresh($user);

        $this->eventDispatcher->dispatch(new UserCreatedEvent($user));
        return $security->login($user, "login_link", "main");
    }

    #[Route(path: "/login", name: "login")]
    public function login(
        Request $request,
    ): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);

        if ($user) {
            $this->eventDispatcher->dispatch(new LoginAttemptEvent($user));
        }

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
