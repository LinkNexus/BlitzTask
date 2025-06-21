<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

final class AppController extends AbstractController
{
    #[Route("/flash-messages", name: "flash-messages", methods: ["GET"])]
    public function index(Request $request, #[MapQueryParameter] $key = null): JsonResponse
    {
        $flashBag = $request->getSession()->getFlashBag();
        if ($key) return $this->json($flashBag->get($key));
        return $this->json($flashBag->all());
    }

    #[Route(path: "/me", name: "me", methods: ["GET"])]
    #[IsGranted("IS_AUTHENTICATED_FULLY")]
    public function me(): JsonResponse
    {
        return $this->json(
            $this->getUser(),
            Response::HTTP_OK,
            [],
            ['groups' => ['user:read']]
        );
    }
}
