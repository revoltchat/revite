import { useEffect, useState } from "preact/hooks";
import { useParams } from "react-router-dom";
import styled, { keyframes } from "styled-components/macro";

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
`;

const Page = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 100vh;
    background: var(--primary-background);
    padding: 40px 20px;
    box-sizing: border-box;
`;

const Card = styled.div`
    background: var(--secondary-background);
    border-radius: 12px;
    padding: 40px 48px;
    max-width: 560px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const Title = styled.h1`
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: var(--foreground);
`;

const Subtitle = styled.p`
    margin: 0;
    font-size: 15px;
    color: var(--secondary-foreground);
    line-height: 1.6;
`;

const Steps = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const Step = styled.div<{ active?: boolean; done?: boolean }>`
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    border-radius: 8px;
    background: var(--primary-background);
    font-size: 14px;
    color: ${(p) => (p.done ? "var(--success)" : p.active ? "var(--foreground)" : "var(--tertiary-foreground)")};
`;

const Dot = styled.div<{ active?: boolean; done?: boolean }>`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
    background: ${(p) =>
        p.done ? "var(--success)" : p.active ? "var(--accent)" : "var(--tertiary-foreground)"};
    animation: ${(p) => (p.active ? pulse : "none")} 1.5s ease-in-out infinite;
`;

const STEPS = [
    "Receiving file",
    "Extracting text",
    "Analysing content",
    "Building your studio",
    "Ready",
];

export default function BookProcessing() {
    const { server } = useParams<{ server: string }>();
    const [activeStep, setActiveStep] = useState(0);
    const [status, setStatus] = useState<"processing" | "ready" | "error">("processing");

    useEffect(() => {
        let step = 0;
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/servers/${server}/books/status`, {
                    headers: { "x-session-token": localStorage.getItem("session_token") ?? "" },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === "ready") {
                        setActiveStep(STEPS.length - 1);
                        setStatus("ready");
                        clearInterval(interval);
                        return;
                    }
                    if (typeof data.step === "number") {
                        setActiveStep(data.step);
                        return;
                    }
                }
            } catch {
                // silently advance for now
            }
            step = Math.min(step + 1, STEPS.length - 2);
            setActiveStep(step);
        }, 4000);

        return () => clearInterval(interval);
    }, [server]);

    return (
        <Page>
            <Card>
                <div>
                    <Title>Loading your book</Title>
                    <Subtitle style={{ marginTop: 8 }}>
                        {status === "ready"
                            ? "Your book is ready! Head back to the studio to explore it."
                            : "We're processing your book. This usually takes a few minutes — feel free to keep chatting with Otto while you wait."}
                    </Subtitle>
                </div>

                <Steps>
                    {STEPS.map((label, i) => (
                        <Step
                            key={label}
                            active={i === activeStep && status !== "ready"}
                            done={i < activeStep || status === "ready"}>
                            <Dot
                                active={i === activeStep && status !== "ready"}
                                done={i < activeStep || status === "ready"}
                            />
                            {label}
                        </Step>
                    ))}
                </Steps>
            </Card>
        </Page>
    );
}
