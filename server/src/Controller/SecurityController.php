<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;

#[Route(path: "/auth", name: "auth.")]
final class SecurityController extends AbstractController
{
    public function __construct(private readonly EntityManagerInterface $entityManager)
    {}
}
