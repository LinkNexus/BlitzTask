<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Notifier\NotifierInterface;
use Symfony\Component\Notifier\Recipient\Recipient;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\LoginLink\LoginLinkHandlerInterface;
use Symfony\Component\Security\Http\LoginLink\LoginLinkNotification;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route(path: "/auth", name: "auth.")]
final class SecurityController extends AbstractController
{
    public function __construct(private readonly EntityManagerInterface $entityManager)
    {}

    #[Route(path: "/register", name: "register", methods: ["POST"])]
    public function register(Request $request, ValidatorInterface $validator, Security $security)
    {
        $data = json_decode($request->getContent(), true);
        $user = new User();
        $user->setEmail($data['email']);
        $user->setName($data['name']);

        $errors = $validator->validate($user);

        if (count($errors) > 0) {
            $errorsArray = [];
            foreach ($errors as $error) {
                $errorsArray[$error->getPropertyPath()] = $error->getMessage();
            }
            return $this->json($errorsArray, Response::HTTP_BAD_REQUEST);
        }

        if ($this->entityManager->getRepository(User::class)->findOneBy(['email' => $user->getEmail()])) {
            return $this->json(['email' => "There is already an account with this email"], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        return $this->json(
            $user,
            Response::HTTP_CREATED,
            [],
            ['groups' => ['user:read']]
        );
    }

    #[Route('/login_check', name: 'login_check')]
    public function check(#[Autowire("%env(CLIENT_URL)%")] string $clientUrl, Request $request) {
        $separator = parse_url($clientUrl, PHP_URL_QUERY) ? '&' : '?';
        return $this->redirect($clientUrl ."/auth/login_check". $separator .
            http_build_query([
                "expires" => $request->query->get("expires"),
                "user" => $request->query->get("user"),
                "hash" => $request->query->get("hash"),
            ])
        );
    }

    #[Route(path: "/login", name: "login", methods: ["POST"])]
    public function login(Request $request, LoginLinkHandlerInterface $loginLinkHandler, NotifierInterface $notifier): JsonResponse
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

        // The user must not directly know if the email exists in the system
        return $this->json(['status' => 'success'], Response::HTTP_OK);
    }
}
