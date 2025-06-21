<?php

namespace App\Controller;

use App\Entity\TaskColumn;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Exception\ORMException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/task-columns', name: "task_column.")]
final class TaskColumnController extends AbstractController
{
    public function __construct(private readonly EntityManagerInterface $entityManager)
    {
    }

    #[Route("", name: "create", methods: ["POST"])]
    public function create(
        #[MapRequestPayload] TaskColumn $taskColumn
    ): JsonResponse
    {
        $this->entityManager->persist($taskColumn);
        $this->entityManager->flush();

        try {
            $this->entityManager->refresh($taskColumn);
        } catch (ORMException $e) {
            return $this->json(
                ['error' => $e->getMessage()],
                500
            );
        }

        return $this->json(
            $taskColumn,
            201
        );
    }
}
