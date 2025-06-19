<?php

namespace App\Entity;

use App\Repository\TaskColumnRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: TaskColumnRepository::class)]
class TaskColumn
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: "The column title cannot be blank.")]
    #[Assert\Length(max: 255)]
    #[Assert\Regex(pattern: '/^[\w -]+$/', message: "The name can only contain letters, numbers, dashes and underscores.")]
    private ?string $title = null;

    #[ORM\Column(length: 7)]
    #[Assert\NotBlank(message: "The column color cannot be blank.")]
    #[Assert\CssColor(message: "The column color must be in a valid CSS format.")]
    private ?string $color = null;

    /**
     * @var Collection<int, Task>
     */
    #[ORM\OneToMany(targetEntity: Task::class, mappedBy: 'relatedColumn', orphanRemoval: true)]
    private Collection $tasks;

    #[ORM\Column]
    #[Assert\NotBlank(message: "The column score cannot be blank.")]
    #[Assert\Type(type: 'float', message: "The score must be a valid number.")]
    private ?float $score = null;

    public function __construct()
    {
        $this->tasks = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getColor(): ?string
    {
        return $this->color;
    }

    public function setColor(string $color): static
    {
        $this->color = $color;

        return $this;
    }

    /**
     * @return Collection<int, Task>
     */
    public function getTasks(): Collection
    {
        return $this->tasks;
    }

    public function addTask(Task $task): static
    {
        if (!$this->tasks->contains($task)) {
            $this->tasks->add($task);
            $task->setRelatedColumn($this);
        }

        return $this;
    }

    public function removeTask(Task $task): static
    {
        if ($this->tasks->removeElement($task)) {
            // set the owning side to null (unless already changed)
            if ($task->getRelatedColumn() === $this) {
                $task->setRelatedColumn(null);
            }
        }

        return $this;
    }

    public function getScore(): ?float
    {
        return $this->score;
    }

    public function setScore(float $score): static
    {
        $this->score = $score;

        return $this;
    }
}
