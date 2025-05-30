<?php

namespace App\DTO;

use Symfony\Component\Validator\Constraints as Assert;

class CreateUserDTO
{
    #[Assert\Email(message: 'The email "{{ value }}" is not a valid email.')]
    public ?string $email = null;

    #[Assert\Length(min: 2, max: 255, minMessage: "The name must be at least {{ limit }} characters long", maxMessage: "The name cannot be longer than {{ limit }} characters")]
    public ?string $name = null;
}
