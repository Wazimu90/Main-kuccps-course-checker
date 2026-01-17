"use client"

import dynamic from "next/dynamic"

const MobileTutorial = dynamic(() => import("./mobile-tutorial"), {
    ssr: false,
})

export default function MobileTutorialWrapper() {
    return <MobileTutorial />
}
