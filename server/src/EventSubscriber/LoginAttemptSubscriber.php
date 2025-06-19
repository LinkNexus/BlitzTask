<?php

namespace App\EventSubscriber;

use App\Event\LoginAttemptEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Notifier\NotifierInterface;
use Symfony\Component\Notifier\Recipient\Recipient;
use Symfony\Component\Security\Http\LoginLink\LoginLinkHandlerInterface;
use Symfony\Component\Security\Http\LoginLink\LoginLinkNotification;

final readonly class LoginAttemptSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private LoginLinkHandlerInterface $loginLinkHandler,
        private NotifierInterface         $notifier
    )
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            LoginAttemptEvent::class => 'sendLoginLinkNotification',
        ];
    }

    public function sendLoginLinkNotification(LoginAttemptEvent $event): void
    {
        $user = $event->getUser();
        $loginLinkDetails = $this->loginLinkHandler->createLoginLink($user);
        $notification = new LoginLinkNotification(
            $loginLinkDetails,
            "Sign In to BlitzTask!"
        );
        $recipient = new Recipient($user->getEmail());
        $this->notifier->send($notification, $recipient);
    }
}
