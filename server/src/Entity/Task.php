<?php

namespace App\Entity;

use App\Enum\TaskPriority;
use App\Repository\TaskRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TaskRepository::class)]
class Task
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(enumType: TaskPriority::class)]
    private ?TaskPriority $priority = null;

    /**
     * @var Collection<int, User>
     */
    #[ORM\ManyToMany(targetEntity: User::class, inversedBy: 'tasks')]
    private Collection $assignees;

    #[ORM\Column(type: Types::DATE_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $dueDate = null;

    /**
     * @var Collection<int, TaskLabel>
     */
    #[ORM\ManyToMany(targetEntity: TaskLabel::class)]
    private Collection $labels;

    #[ORM\ManyToOne(inversedBy: 'tasks')]
    #[ORM\JoinColumn(nullable: false)]
    private ?TaskColumn $relatedColumn = null;

    public function __construct()
    {
        $this->assignees = new ArrayCollection();
        $this->labels = new ArrayCollection();
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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getPriority(): ?TaskPriority
    {
        return $this->priority;
    }

    public function setPriority(TaskPriority $priority): static
    {
        $this->priority = $priority;

        return $this;
    }

    /**
     * @return Collection<int, User>
     */
    public function getAssignees(): Collection
    {
        return $this->assignees;
    }

    public function addAssignee(User $assignee): static
    {
        if (!$this->assignees->contains($assignee)) {
            $this->assignees->add($assignee);
        }

        return $this;
    }

    public function removeAssignee(User $assignee): static
    {
        $this->assignees->removeElement($assignee);

        return $this;
    }

    public function getDueDate(): ?\DateTimeImmutable
    {
        return $this->dueDate;
    }

    public function setDueDate(?\DateTimeImmutable $dueDate): static
    {
        $this->dueDate = $dueDate;

        return $this;
    }

    /**
     * @return Collection<int, TaskLabel>
     */
    public function getLabels(): Collection
    {
        return $this->labels;
    }

    public function addLabel(TaskLabel $label): static
    {
        if (!$this->labels->contains($label)) {
            $this->labels->add($label);
        }

        return $this;
    }

    public function removeLabel(TaskLabel $label): static
    {
        $this->labels->removeElement($label);

        return $this;
    }

    public function getRelatedColumn(): ?TaskColumn
    {
        return $this->relatedColumn;
    }

    public function setRelatedColumn(?TaskColumn $relatedColumn): static
    {
        $this->relatedColumn = $relatedColumn;

        return $this;
    }
}
