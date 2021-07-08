// This file must be imported and used at least once for SVG masks.

export default function Masks() {
    return (
        <svg width={0} height={0} style={{ position: "fixed" }}>
            <defs>
                <mask id="server">
                    <rect x="0" y="0" width="32" height="32" fill="white" />
                    <circle cx="27" cy="5" r="7" fill={"black"} />
                </mask>
                <mask id="user">
                    <rect x="0" y="0" width="32" height="32" fill="white" />
                    <circle cx="27" cy="27" r="7" fill={"black"} />
                </mask>
                <mask id="session">
                    <rect x="0" y="0" width="32" height="32" fill="white" />
                    <circle cx="26" cy="30" r="12" fill={"black"} />
                </mask>
                <mask id="overlap">
                    <rect x="0" y="0" width="32" height="32" fill="white" />
                    <circle cx="32" cy="16" r="18" fill={"black"} />
                </mask>
            </defs>
        </svg>
    );
}
