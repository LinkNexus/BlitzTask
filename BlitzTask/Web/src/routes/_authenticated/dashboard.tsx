import { resendConfirmEmail } from "@/api";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({
    component: RouteComponent,
});

function RouteComponent() {
    return <div>
        <h1>Dashboard</h1>

        <Button onClick={async () => {
            await resendConfirmEmail();
        }}>Resend</Button>
    </div>;
}
