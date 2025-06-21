<?php

namespace App\EventSubscriber;

use App\Entity\TaskColumn;
use App\Event\UserCreatedEvent;
use App\Security\EmailVerifier;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Mime\Address;

final readonly class UserCreationSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private EmailVerifier          $emailVerifier,
        private EntityManagerInterface $entityManager,
        private RequestStack           $requestStack
    )
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            UserCreatedEvent::class => [
                ['sendVerificationEmail', 10],
                ['createDefaultColumns', 5]
            ],
        ];
    }

    public function sendVerificationEmail(UserCreatedEvent $event): void
    {
        $user = $event->getUser();
        $this->emailVerifier->sendEmailConfirmation("auth.verify_email", $user, (new TemplatedEmail)
            ->to(new Address($user->getEmail(), $user->getName()))
            ->subject("Registration Confirmation to BlitzTask!")
            ->htmlTemplate("auth/registration_email.html.twig")
        );
        $this->requestStack->getSession()->getFlashBag()->add("success", "Please check your email to verify your account.");
    }

    public function createDefaultColumns(UserCreatedEvent $event): void
    {
        $user = $event->getUser();

        /** @var TaskColumn[] $columns */
        $columns = [
            (new TaskColumn())->setColor("#93c5fd")
                ->setTitle("To Do")
                ->setScore(100),
            (new TaskColumn())->setColor("#fde047")
                ->setTitle("In Progress")
                ->setScore(300),
            (new TaskColumn())->setColor("#d8b4fe")
                ->setTitle("Done")
                ->setScore(500),
        ];

        array_walk($columns, function ($column) use ($user) {
            $column->setOwner($user);
            $this->entityManager->persist($column);
        });
        $this->entityManager->flush();
    }
}
