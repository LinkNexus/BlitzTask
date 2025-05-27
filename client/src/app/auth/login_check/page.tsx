import {AuthHeader} from "@/components/custom/auth/header";
import {Button} from "@/components/ui/button";

export default async function LoginCheckPage({searchParams}: {
    searchParams: Promise<{ user: string, expires: string, hash: string }>
}) {
    const {user, expires, hash} = await searchParams;
    const {NEXT_PUBLIC_SERVER_URL} = process.env;

    return (
        <>
            <AuthHeader message="Just one more step to login!">
                <span>
                    Click on the button below to login to our website!
                </span>
            </AuthHeader>

            <form method="POST" action={NEXT_PUBLIC_SERVER_URL + "/auth/login_check"} className="w-full">
                <input type="hidden" name="expires" value={expires}/>
                <input type="hidden" name="user" value={user}/>
                <input type="hidden" name="hash" value={hash}/>

                <Button className="w-full" type="submit">Continue</Button>
            </form>
        </>
    )
}