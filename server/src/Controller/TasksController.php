<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route(path: '/tasks', name: 'tasks.')]
final class TasksController extends AbstractController
{
    #[Route('/', methods: ["POST"])]
    public function create(Request $request): Response
    {
        $data = json_decode($request->getContent(), true);
        return $this->json($data);
    }
}
