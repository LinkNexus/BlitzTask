<?php

namespace App\Controller;

use App\Entity\TaskColumn;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

final class TaskColumnController extends AbstractController
{
    #[Route('/columns', methods: ['POST'])]
    public function create(
        #[MapRequestPayload] TaskColumn $taskColumn
    ): JsonResponse
    {
        return $this->json(
            $taskColumn,
            201
        );
    }
}
