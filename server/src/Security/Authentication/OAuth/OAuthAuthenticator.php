<?php

namespace App\Security\Authentication\OAuth;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use KnpU\OAuth2ClientBundle\Security\Authenticator\OAuth2Authenticator;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

class OAuthAuthenticator extends OAuth2Authenticator
{
    public function __construct(
        private readonly ClientRegistry                          $clientRegistry,
        private readonly EntityManagerInterface                  $entityManager,
        #[Autowire('%env(CLIENT_URL)%')] private readonly string $clientUrl
    )
    {
    }

    /**
     * @param Request $request
     * @return bool|null
     */
    public function supports(Request $request): ?bool
    {
        return "auth.oauth_check" === $request->attributes->get('_route')
            && in_array($request->get("service"), ["github"]);
    }

    /**
     * @param Request $request
     * @return Passport
     */
    public function authenticate(Request $request): Passport
    {
        $service = $request->get("service");
        $client = $this->clientRegistry->getClient($service);
        $accessToken = $this->fetchAccessToken($client);

        return new SelfValidatingPassport(
            new UserBadge($accessToken->getToken(), function () use ($accessToken, $client, $service) {
                $resourceOwner = $client->fetchUserFromToken($accessToken);
                $email = $resourceOwner->getEmail();

                $existingUser = $this->entityManager->getRepository(User::class)->findOneBy([
                    "{$service}Id" => $resourceOwner->getId(),
                ]);

                if ($existingUser) return $existingUser;

                $user = $this->entityManager->getRepository(User::class)->findOneBy([
                    'email' => $email,
                ]);
                if ($user === null) $user = new User();

                if (!$user->getName()) $user->setName($resourceOwner->getName());
                $user->setEmail($email);
                $user["set" . ucfirst($service) . "Id"]($resourceOwner->getId());

                $this->entityManager->persist($user);
                $this->entityManager->flush();

                return $user;
            })
        );
    }

    /**
     * @param Request $request
     * @param TokenInterface $token
     * @param string $firewallName
     * @return Response|null
     */
    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return new RedirectResponse($this->clientUrl);
    }

    /**
     * @param Request $request
     * @param AuthenticationException $exception
     * @return Response|null
     */
    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        $request->getSession()->getFlashBag()->add('error', $exception->getMessage());
        return new RedirectResponse("{$this->clientUrl}/auth/login", 401);
    }
}
