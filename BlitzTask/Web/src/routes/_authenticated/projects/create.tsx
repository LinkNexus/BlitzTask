import type { ProjectDetails } from "@/api";
import { createProjectMutation } from "@/api/@tanstack/react-query.gen";
import { DatePickerField } from "@/components/forms/fields/date-picker-field";
import { DropzoneField } from "@/components/forms/fields/dropzone-field";
import { InputField } from "@/components/forms/fields/input-field";
import { TextCollectionField } from "@/components/forms/fields/text-collection-field";
import { TextareaField } from "@/components/forms/fields/textarea-field";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { mapErrorsToForm } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { Route as DashboardRoute } from "../dashboard";

export const CreateProjectSchema = z.object({
	name: z
		.string()
		.min(1, "Project name is required")
		.max(255, "Project name must be at most 255 characters long"),
	description: z
		.string()
		.max(1000, "Description must be at most 1000 characters long"),
	startDate: z.iso.datetime().nullable(),
	dueDate: z.iso.datetime().nullable(),
	tags: z.array(z.string().max(50)).max(10, "Maximum 10 tags allowed"),
	image: z
		.file()
		.max(350_000)
		.mime(["image/png", "image/jpeg", "image/svg+xml", "image/webp"])
		.nullable(),
});

export const Route = createFileRoute("/_authenticated/projects/create")({
	component: CreateProjectPage,
});

function CreateProjectPage() {
	const navigate = Route.useNavigate();
	const queryClient = useQueryClient();

	const form = useForm({
		resolver: zodResolver(CreateProjectSchema),
		defaultValues: {
			name: "",
			description: "",
			startDate: new Date().toISOString(),
			dueDate: null,
			tags: [],
			image: null,
		},
	});

	const createProjectMut = useMutation({
		...createProjectMutation(),
		onSuccess: async (project: ProjectDetails) => {
			// Set the project data in the cache for the single project page
			// This avoids needing to refetch when navigating to the project
			queryClient.setQueryData(["project", project.id], project);

			// Navigate to the newly created project
			await navigate({
				to: "/projects/$projectId",
				params: { projectId: project.id },
			});
		},
		onError: (error) => {
			// Handle validation errors
			if (error && "errors" in error && error.errors) {
				mapErrorsToForm(form, error.errors);
			}
		},
	});

	async function onSubmit(formData: z.infer<typeof CreateProjectSchema>) {
		createProjectMut.mutate({
			body: formData,
		});
	}

	return (
		<div className="min-h-screen">
			<div className="max-w-4xl mx-auto py-8 px-4">
				{/* Header */}
				<div className="mb-8">
					<Link
						to={DashboardRoute.to}
						onClick={() => navigate({ to: "/dashboard" })}
						className="mb-4 flex items-center hover:underline underline-offset-2"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Dashboard
					</Link>
					<h1 className="text-3xl font-bold">Create New Project</h1>
					<p className="mt-2">
						Set up your project with all the details needed to get started
					</p>
				</div>

				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FieldGroup>
						<Controller
							control={form.control}
							name="name"
							render={({ field, fieldState }) => (
								<InputField
									field={field}
									fieldState={fieldState}
									labelProps={{ children: "Project Name" }}
								/>
							)}
						/>

						<Controller
							control={form.control}
							name="description"
							render={({ field, fieldState }) => (
								<TextareaField
									field={field}
									inputProps={{ rows: 7 }}
									fieldState={fieldState}
									labelProps={{ children: "Project Description" }}
								/>
							)}
						/>

						<Controller
							control={form.control}
							name="tags"
							render={({ field, fieldState }) => (
								<TextCollectionField
									field={field}
									fieldState={fieldState}
									labelProps={{ children: "Tags" }}
								/>
							)}
						/>

						<Controller
							control={form.control}
							name="startDate"
							render={({ field, fieldState }) => (
								<DatePickerField
									field={field}
									fieldState={fieldState}
									labelProps={{ children: "Start Date" }}
								/>
							)}
						/>

						<Controller
							control={form.control}
							name="dueDate"
							render={({ field, fieldState }) => (
								<DatePickerField
									field={field}
									fieldState={fieldState}
									labelProps={{ children: "Due Date" }}
								/>
							)}
						/>

						<Controller
							name="image"
							control={form.control}
							render={({ field, fieldState }) => (
								<DropzoneField
									field={field}
									fieldState={fieldState}
									labelProps={{ children: "Project Image" }}
									inputProps={{
										accept: {
											"image/png": [".png"],
											"image/jpeg": [".jpg", ".jpeg"],
											"image/svg+xml": [".svg"],
											"image/webp": [".webp"],
										},
										maxSize: 3 * 1024 * 1024,
										multiple: false,
										onDrop: (file) => {
											field.onChange(file[0] || null);
										},
									}}
								/>
							)}
						/>

						<Field>
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? (
									<>
										<Spinner /> Creating project...
									</>
								) : (
									"Create project"
								)}
							</Button>
						</Field>

						{/* <Controller */}
						{/*   control={form.control} */}
						{/*   name="tags" */}
						{/*   render={({ field, fieldState }) => ( */}
						{/*     <ChoiceCollectionField */}
						{/*       field={field} */}
						{/*       labelProps={{ children: "Tags" }} */}
						{/*       // allItems={} */}
						{/*     /> */}
						{/*   )} */}
						{/* /> */}
					</FieldGroup>
				</form>
			</div>
		</div>
	);
}
