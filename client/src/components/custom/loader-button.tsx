import { ComponentProps } from "react";
import { Button } from "../ui/button";
import { LoadingSpinner } from "../ui/spinner";

export function LoaderButton({ loading, children, ...props }: ComponentProps<typeof Button> & { loading: boolean }) {
    return (
        <Button {...props}>
            {loading ? <LoadingSpinner /> : children}
        </Button>
    )
}