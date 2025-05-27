<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\Routing\Attribute\Route;

#[Route("/flash-messages", name: "flash_messages_")]
final class FlashMessagesController extends AbstractController
{
    #[Route("/", name: "index", methods: ["GET"])]
    public function index(Request $request, #[MapQueryParameter] $key = null): JsonResponse
    {
        $flashBag = $request->getSession()->getFlashBag();
        $this->addFlash("success", "This is a success message.");

        if ($key) return $this->json($flashBag->get($key));
        return $this->json($request->getSession()->getFlashBag()->all());
    }
}
