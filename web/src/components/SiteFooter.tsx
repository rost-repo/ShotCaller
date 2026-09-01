import { Coffee } from "lucide-react";

const links = [
    {
        href: "https://www.linkedin.com/in/rafael-rost-rosa/",
        label: "LinkedIn",
        icon: <span aria-hidden="true" className="font-sans text-[17px] font-bold leading-none">in</span>,
    },
    {
        href: "https://x.com/shotcallergame",
        label: "X (Twitter)",
        icon: <span aria-hidden="true" className="text-[18px] leading-none">𝕏</span>,
    },
    {
        href: "https://buymeacoffee.com/shotcaller",
        label: "Buy Me a Coffee",
        icon: <Coffee size={18} aria-hidden="true" />,
    },
];

export default function SiteFooter() {
    return (
        <footer className="mt-8 border-t-2 border-hairline pt-7 pb-2 text-center">
            <nav aria-label="Shotcaller links" className="flex justify-center gap-2.5">
                {links.map(({ href, label, icon }) => (
                    <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        title={label}
                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-surface text-ink shadow-sticker-sm transition-transform hover:-translate-y-0.5 hover:bg-primary hover:text-on-primary focus-visible:-translate-y-0.5 focus-visible:bg-primary focus-visible:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    >
                        {icon}
                    </a>
                ))}
            </nav>
            <p className="mx-auto mt-4 max-w-150 text-[11px] leading-relaxed text-ink-muted">
                Shotcaller is an independent fan project, not affiliated with or endorsed by the NBA.
            </p>
            <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSdGA2jurSUvjyemSur3HLETUGJsaiqVOViBzkRDVyfvgvBjbw/viewform?usp=publish-editor"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-[12px] font-semibold text-ink underline decoration-primary decoration-2 underline-offset-3"
            >
                Send feedback or report a bug
            </a>
            <a
                href="https://buymeacoffee.com/shotcaller"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-[12px] font-semibold text-ink underline decoration-primary decoration-2 underline-offset-3"
            >
                Support Shotcaller on Buy Me a Coffee
            </a>
        </footer>
    );
}
