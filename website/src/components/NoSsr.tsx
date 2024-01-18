import React, { useEffect, useState } from "react"

interface NoSsrProps {
    children: React.ReactNode
}

export function NoSsr({ children }: NoSsrProps) {
    const [isServer, setIsServer] = useState<boolean>(true)

    useEffect(function () {
        setIsServer(typeof window === "undefined")
    }, [])

    if (!isServer) {
        return null
    }

    return <>{children}</>
}
