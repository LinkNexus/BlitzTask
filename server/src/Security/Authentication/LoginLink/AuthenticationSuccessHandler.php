<?php

namespace App\Security\Authentication\LoginLink;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationSuccessHandlerInterface;
use Symfony\Component\Serializer\SerializerInterface;

final readonly class AuthenticationSuccessHandler implements AuthenticationSuccessHandlerInterface
{

    public function __construct(private SerializerInterface $serializer)
    {
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token): ?Response
    {
        $serializedUser = $this->serializer->serialize($token->getUser(), "json", ["groups" => ["user:read"]]);
        return new JsonResponse($serializedUser, Response::HTTP_OK, [], true);
    }
}
