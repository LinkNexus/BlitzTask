using System;
using FluentValidation;

namespace BlitzTask.Features.Projects;

public class CreateProjectRequestValidator : AbstractValidator<CreateProjectRequest>
{
    public CreateProjectRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).MaximumLength(1000);
        RuleFor(x => x.DueDate).GreaterThan(x => x.StartDate).When(x => x.DueDate.HasValue);
        RuleFor(x => x.Tags)
            .Must(tags =>
            {
                if (tags == null)
                    return true;
                var uniqueTags = new HashSet<string>(tags);
                return uniqueTags.Count == tags.Count && tags.Count <= 10;
            })
            .WithMessage("A project can have a maximum of 10 distinct tags.");
        RuleForEach(x => x.Tags).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Image)
            .Must(file => file == null || file.Length <= 3 * 1024 * 1024)
            .WithMessage("Image size must be less than or equal to 3MB.")
            .Must(file => file == null || file.ContentType.StartsWith("image/"))
            .WithMessage("Only image files are allowed.");
    }
}
