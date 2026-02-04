import { Navbar } from "@/components/web/navbar";

export default function sharedLayout({children} : {children : React.ReactNode}) {
    return (
        <>
            <Navbar/>
            {children}
        </>
    )
}