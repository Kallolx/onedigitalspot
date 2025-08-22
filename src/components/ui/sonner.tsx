import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"
import React, { useEffect, useState } from "react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const [position, setPosition] = useState<ToasterProps["position"]>(
  // default to bottom-left for desktop
  "bottom-left"
  )

  useEffect(() => {
    // match mobile screens (<= 767px)
    const mq = window.matchMedia("(max-width: 767px)")

    const apply = (m: MediaQueryList | MediaQueryListEvent) => {
      if ((m as MediaQueryList).matches) {
        // mobile: show from top center
        setPosition("top-center")
      } else {
  // desktop: show from bottom left
  setPosition("bottom-left")
      }
    }

    // initial
    apply(mq as MediaQueryList)

    // listener
    const listener = (e: MediaQueryListEvent) => apply(e)
    try {
      mq.addEventListener("change", listener)
    } catch (e) {
      // Safari fallback
      // @ts-ignore
      mq.addListener(listener)
    }

    return () => {
      try {
        mq.removeEventListener("change", listener)
      } catch (e) {
        // @ts-ignore
        mq.removeListener(listener)
      }
    }
  }, [])

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position={position}
      className="toaster group"
      toastOptions={{
        classNames: {
          // base toast: background (bg-background), border, shadow, and use sans font
          toast:
            "group toast font-sans group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          // description uses muted-foreground and sans
          description: "group-[.toast]:text-muted-foreground group-[.toast]:font-sans",
          // action/cancel buttons use sans font and keep color styling
          actionButton:
            "group-[.toast]:font-sans group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:font-sans group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
