import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "preact/hooks";
import { Link, useHistory } from "react-router-dom";
import styled, { keyframes } from "styled-components/macro";

import { useApplicationState } from "../../mobx/State";
import { useClient } from "../../controllers/client/ClientController";

// ── animations ──────────────────────────────────────────────────────────────

const float = keyframes`
    0%,100% { transform: translateY(0) rotate(-1deg); }
    50%      { transform: translateY(-8px) rotate(1deg); }
`;

const pulseGlow = keyframes`
    0%,100% { box-shadow: 0 0 0 0   rgba(var(--accent-h,255), var(--accent-s,160), var(--accent-l,60), .35); }
    50%      { box-shadow: 0 0 0 8px rgba(var(--accent-h,255), var(--accent-s,160), var(--accent-l,60), 0);   }
`;

const twinkle = keyframes`from{opacity:.1}to{opacity:.7}`;

// ── layout ───────────────────────────────────────────────────────────────────

const Wrap = styled.div`
    height: 100%;
    overflow-y: auto;
    padding: 16px 18px 32px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-sizing: border-box;
    position: relative;
`;

const Stars = styled.div`
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
`;

const StarDot = styled.div<{ x: number; y: number; sz: number; dur: number; del: number }>`
    position: absolute;
    border-radius: 50%;
    background: var(--foreground);
    width:  ${p => p.sz}px;
    height: ${p => p.sz}px;
    top:   ${p => p.y}%;
    left:  ${p => p.x}%;
    animation: ${twinkle} ${p => p.dur}s ${p => p.del}s infinite alternate;
`;

const Inner = styled.div`
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

// ── welcome bar ──────────────────────────────────────────────────────────────

const WelcomeBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    background: var(--hover);
    border: 1px solid var(--accent);
    border-radius: 13px;
    padding: 13px 18px;
    position: relative;
    overflow: hidden;
    &::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--accent), transparent);
        opacity: .5;
    }
`;

const WelcomeText = styled.div`
    flex: 1;
    h2 { font-size: 14px; font-weight: 700; color: var(--accent); margin: 0 0 3px; }
    p  { font-size: 11px; color: var(--secondary-foreground); margin: 0 0 9px; }
`;

const Chips = styled.div`display:flex;flex-wrap:wrap;gap:6px;`;

const Chip = styled.span<{ $v?: "green" | "orange" | "red" }>`
    font-size: 10px;
    padding: 2px 9px;
    border-radius: 10px;
    background: ${p => p.$v === "green"  ? "rgba(74,222,128,.1)"
                      : p.$v === "red"   ? "rgba(248,113,113,.1)"
                      : "rgba(255,160,60,.1)"};
    color:      ${p => p.$v === "green"  ? "#4ade80"
                      : p.$v === "red"   ? "#f87171"
                      : "var(--accent)"};
    border: 1px solid ${p => p.$v === "green"  ? "rgba(74,222,128,.25)"
                            : p.$v === "red"   ? "rgba(248,113,113,.25)"
                            : "rgba(255,160,60,.25)"};
`;

const OttoWrap = styled.div`
    width: 88px;
    height: 88px;
    flex-shrink: 0;
    animation: ${float} 3s ease-in-out infinite;
    img { width: 88px; height: 88px; object-fit: contain; }
`;

// ── approval banner ──────────────────────────────────────────────────────────

const ApprovalBanner = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    background: var(--hover);
    border: 1px solid var(--accent);
    border-radius: 12px;
    padding: 12px 16px;
    animation: ${pulseGlow} 2.5s infinite;
`;

const ApprIcon = styled.div`
    width: 40px; height: 40px;
    border-radius: 9px;
    background: rgba(255,160,60,.12);
    border: 1px solid var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
`;

const ApprTitle = styled.div`font-size:13px;font-weight:600;color:var(--foreground);`;
const ApprSub   = styled.div`font-size:10px;color:var(--secondary-foreground);margin-top:2px;`;

const ApprBtn = styled.button`
    font-size: 12px; font-weight: 600;
    background: var(--accent); color: #080c18;
    border: none; border-radius: 7px;
    padding: 7px 16px; cursor: pointer;
    white-space: nowrap; flex-shrink: 0;
    text-decoration: none; display: inline-block;
    &:hover { opacity: .88; }
`;

// ── 4-card wins bar ──────────────────────────────────────────────────────────

const WinsBar = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 11px;
    @media (max-width: 900px) { grid-template-columns: repeat(2,1fr); }
    @media (max-width: 500px) { grid-template-columns: 1fr; }
`;

const WinCard = styled.div<{ $color: string }>`
    background: var(--secondary-background);
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 13px;
    padding: 13px 14px;
    cursor: pointer;
    position: relative; overflow: hidden;
    transition: border-color .2s;
    &:hover { border-color: ${p => p.$color}; }
    &::before {
        content: '';
        position: absolute; top: 0; left: 0; right: 0; height: 2px; opacity: .55;
        background: linear-gradient(90deg, transparent, ${p => p.$color}, transparent);
    }
`;

const WinLabel  = styled.div`font-size:9px;color:var(--secondary-foreground);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:4px;`;
const WinNumber = styled.div<{ $color: string }>`font-size:24px;font-weight:800;color:${p => p.$color};line-height:1;`;
const WinDelta  = styled.div`font-size:10px;color:#4ade80;margin-top:4px;`;
const MorePill  = styled.div<{ $color: string }>`
    display:inline-flex;align-items:center;gap:3px;
    font-size:9px;border:1px solid;border-radius:10px;
    padding:2px 8px;cursor:pointer;margin-top:7px;
    color:${p=>p.$color};
    border-color:${p=>p.$color}44;
    background:${p=>p.$color}11;
`;

// ── cards ────────────────────────────────────────────────────────────────────

const Card = styled.div<{ $accent?: string }>`
    background: var(--secondary-background);
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 13px;
    padding: 14px 15px;
    position: relative; overflow: hidden;
    &::before {
        content: '';
        position: absolute; top: 0; left: 0; right: 0; height: 2px; opacity: .5;
        background: linear-gradient(90deg, transparent, ${p => p.$accent ?? "var(--accent)"}, transparent);
    }
`;

const CardTitle = styled.div<{ $color?: string }>`
    font-size: 10px; font-weight: 700;
    letter-spacing: 1.3px; text-transform: uppercase;
    color: ${p => p.$color ?? "var(--accent)"};
    margin-bottom: 10px;
`;

const MoreLink = styled.div`
    font-size: 9px; color: var(--accent); cursor: pointer;
    margin-top: 8px;
    border-top: 1px solid rgba(255,255,255,.05);
    padding-top: 8px;
    &:hover { opacity: .75; }
`;

// ── mid grid 3 ───────────────────────────────────────────────────────────────

const MidGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
    @media (max-width: 900px) { grid-template-columns: 1fr 1fr; }
    @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const MsgRow = styled.div`
    display: flex; align-items: flex-start; gap: 9px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255,255,255,.04);
    &:last-child { border-bottom: none; }
`;

const MsgAv = styled.div<{ $bg: string; $color: string }>`
    width:28px;height:28px;border-radius:50%;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;
    font-size:10px;font-weight:700;
    background:${p=>p.$bg};color:${p=>p.$color};
`;

const MsgBody    = styled.div`flex:1;min-width:0;`;
const MsgFrom    = styled.div`font-size:11px;font-weight:600;color:var(--foreground);`;
const MsgNew     = styled.span`font-size:9px;color:var(--accent);font-weight:700;margin-left:5px;`;
const MsgPreview = styled.div`font-size:10px;color:var(--secondary-foreground);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`;
const MsgTime    = styled.div`font-size:9px;color:var(--tertiary-foreground);margin-top:2px;`;
const UnreadDot  = styled.div`width:6px;height:6px;border-radius:50%;background:var(--accent);flex-shrink:0;margin-top:7px;`;

const BlogItem = styled.div`
    display:flex;align-items:center;gap:9px;
    padding:8px 0;
    border-bottom:1px solid rgba(255,255,255,.04);
    &:last-child { border-bottom:none; }
`;
const BlogIcon  = styled.div`width:30px;height:30px;border-radius:6px;background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.2);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;`;
const BlogTitle = styled.div`font-size:11px;color:var(--foreground);font-weight:500;`;
const BlogMeta  = styled.div`font-size:9px;color:var(--secondary-foreground);margin-top:2px;`;
const BadgeGreen = styled.div`background:rgba(74,222,128,.12);border:1px solid rgba(74,222,128,.3);color:#4ade80;font-size:9px;padding:3px 8px;border-radius:4px;cursor:pointer;white-space:nowrap;`;
const BadgeBlue  = styled.div`background:rgba(96,165,250,.1);border:1px solid rgba(96,165,250,.25);color:#60a5fa;font-size:9px;padding:3px 8px;border-radius:4px;cursor:pointer;white-space:nowrap;`;

const AdItem = styled.div`
    display:flex;align-items:center;gap:10px;
    padding:9px 10px;border-radius:8px;
    background:rgba(255,255,255,.03);
    border:1px solid rgba(255,255,255,.06);
    margin-bottom:7px;
    &:last-of-type { margin-bottom:0; }
`;
const AdPlatform   = styled.div`width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;`;
const AdName       = styled.div`font-size:11px;color:var(--foreground);font-weight:500;`;
const AdMeta       = styled.div`font-size:9px;color:var(--secondary-foreground);margin-top:2px;`;
const AdSpend      = styled.div<{ $color: string }>`font-size:11px;font-weight:700;color:${p=>p.$color};text-align:right;`;
const AdLive       = styled.div`background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.25);color:#4ade80;font-size:9px;padding:2px 7px;border-radius:5px;margin-top:3px;`;
const AdApproveBtn = styled.button`background:rgba(255,160,60,.15);border:1px solid var(--accent);color:var(--accent);font-size:9px;padding:3px 9px;border-radius:5px;cursor:pointer;white-space:nowrap;font-weight:600;margin-top:3px;`;

// ── bottom 2-col ─────────────────────────────────────────────────────────────

const BotGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    @media (max-width: 700px) { grid-template-columns: 1fr; }
`;

const BookRow = styled.div`
    display:flex;align-items:center;gap:9px;
    padding:7px 0;
    border-bottom:1px solid rgba(255,255,255,.04);
    &:last-child{border-bottom:none;}
`;
const BookThumb = styled.div<{ $bg: string; $border: string }>`
    width:32px;height:42px;border-radius:4px;
    background:${p=>p.$bg};border:1px solid ${p=>p.$border};
    display:flex;align-items:center;justify-content:center;
    font-size:16px;flex-shrink:0;
`;
const BookTitle  = styled.div`font-size:11px;color:var(--foreground);font-weight:500;`;
const BookSeries = styled.div`font-size:9px;color:var(--secondary-foreground);margin-top:2px;`;
const ActiveBadge = styled.span`font-size:9px;padding:2px 7px;border-radius:9px;background:rgba(74,222,128,.1);color:#4ade80;border:1px solid rgba(74,222,128,.2);`;

const EimBtn = styled.div`
    display:flex;align-items:center;justify-content:center;gap:10px;
    background:rgba(167,139,250,.08);
    border:2px solid rgba(167,139,250,.35);
    border-radius:12px;padding:13px 18px;cursor:pointer;
    transition:border-color .2s,background .2s;
    &:hover{border-color:rgba(167,139,250,.7);background:rgba(167,139,250,.16);}
`;
const EimTitle = styled.div`font-size:12px;font-weight:700;color:#a78bfa;letter-spacing:.5px;`;
const EimSub   = styled.div`font-size:10px;color:#7860cc;margin-top:2px;`;

const AssetGrid = styled.div`
    display:grid;grid-template-columns:repeat(4,1fr);gap:7px;
`;
const AssetTile = styled.div<{ $dashed?: boolean }>`
    aspect-ratio:1;border-radius:8px;
    background:rgba(255,255,255,.04);
    border:1px ${p=>p.$dashed?"dashed":"solid"} ${p=>p.$dashed?"var(--accent)":"rgba(255,255,255,.07)"};
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;
    cursor:pointer;transition:border-color .2s;
    &:hover{border-color:var(--accent);}
    span{font-size:18px;}
`;
const TileLbl = styled.div`font-size:8px;color:var(--secondary-foreground);text-align:center;`;

// ── account row ──────────────────────────────────────────────────────────────

const AccountGrid = styled.div`
    display:grid;grid-template-columns:1fr 1px 1fr 1px 130px;
    gap:16px;align-items:flex-start;
    @media (max-width:700px){grid-template-columns:1fr;& > div[aria-hidden]{display:none;}}
`;
const VDiv   = styled.div`background:rgba(255,255,255,.06);align-self:stretch;`;
const AcctRow = styled.div`
    display:flex;justify-content:space-between;align-items:center;
    padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04);
    font-size:11px;
    &:last-child{border-bottom:none;}
`;
const AcctLabel = styled.span`color:var(--secondary-foreground);`;
const AcctVal   = styled.span`color:var(--foreground);font-weight:500;`;
const AcctEdit  = styled.span`font-size:9px;color:var(--accent);cursor:pointer;&:hover{opacity:.7;}`;
const PlatRow = styled.div`display:flex;align-items:center;gap:6px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04);&:last-child{border-bottom:none;}`;
const PDot    = styled.div<{ $c: string }>`width:7px;height:7px;border-radius:50%;background:${p=>p.$c};flex-shrink:0;`;
const PName   = styled.span`font-size:11px;color:var(--foreground);flex:1;`;
const SLive   = styled.span`font-size:9px;padding:2px 7px;border-radius:9px;background:rgba(74,222,128,.1);color:#4ade80;border:1px solid rgba(74,222,128,.25);`;
const SPend   = styled.span`font-size:9px;padding:2px 7px;border-radius:9px;background:rgba(251,191,36,.1);color:#fbbf24;border:1px solid rgba(251,191,36,.25);`;

const OttoSupport = styled.div`display:flex;flex-direction:column;align-items:center;gap:7px;`;
const OttoImg     = styled.img`width:60px;height:60px;object-fit:contain;animation:${float} 3s ease-in-out infinite;`;
const OttoBubble  = styled.div`background:var(--hover);border:1px solid var(--accent);border-radius:9px;padding:7px 10px;font-size:10px;color:var(--accent);text-align:center;line-height:1.5;width:100%;`;
const ChatBtn     = styled.button`
    width:100%;font-size:11px;font-weight:600;
    background:var(--hover);color:var(--accent);
    border:1px solid var(--accent);border-radius:7px;
    padding:7px;cursor:pointer;
    text-decoration:none;display:block;text-align:center;
    &:hover{background:var(--accent);color:#080c18;}
`;

// ── component ────────────────────────────────────────────────────────────────

const STARS = Array.from({ length: 55 }, (_, i) => ({
    id: i,
    x: Math.round(Math.random() * 10000) / 100,
    y: Math.round(Math.random() * 10000) / 100,
    sz: Math.round((Math.random() * 1.8 + 0.3) * 10) / 10,
    dur: Math.round((Math.random() * 3 + 2) * 10) / 10,
    del: Math.round(Math.random() * 4 * 10) / 10,
}));

export default observer(() => {
    const client  = useClient();
    const state   = useApplicationState();
    const history = useHistory();

    const username  = client?.user?.display_name ?? client?.user?.username ?? "there";
    const firstName = username.split(/[\s_]/)[0];

    const studioServer =
        state.ordering.orderedServers.find(s =>
            s.name.toLowerCase().includes("studio"),
        ) ?? state.ordering.orderedServers[0];

    const healedRef = useRef(false);

    useEffect(() => {
        if (!client || !client.user) return;
        if (studioServer) return;
        if (healedRef.current) return;
        healedRef.current = true;
        client.api.post("/onboard/heal" as any).catch(() => {});
    }, [client, studioServer]);

    const studioChannels = studioServer
        ? studioServer.channel_ids
              .map((id: string) => client.channels.get(id))
              .filter(Boolean)
        : [];

    const assistantChannel  = studioChannels.find((c: any) => c?.name === "assistant");
    const startHereChannel  = studioChannels.find((c: any) => c?.name === "start-here");
    const onboardingChannel = assistantChannel ?? startHereChannel;

    // New accounts only have #start-here — go straight there
    useEffect(() => {
        if (!studioServer || !startHereChannel || studioChannels.length !== 1) return;
        history.push(`/server/${(studioServer as any)._id}/channel/${(startHereChannel as any)._id}`);
    }, [studioServer, startHereChannel, studioChannels.length]);

    return (
        <Wrap>
            <Stars aria-hidden>
                {STARS.map(s => (
                    <StarDot key={s.id} x={s.x} y={s.y} sz={s.sz} dur={s.dur} del={s.del} />
                ))}
            </Stars>

            <Inner>
                {/* ── welcome ── */}
                <WelcomeBar>
                    <WelcomeText>
                        <h2>Welcome back, {firstName} 👋</h2>
                        <p>
                            {studioServer
                                ? "Your studio is ready. Here's what's happening."
                                : "Your studio is being set up — check back in a moment."}
                        </p>
                        <Chips>
                            <Chip $v="green">Studio Active</Chip>
                            <Chip>Onboarding in Progress</Chip>
                        </Chips>
                    </WelcomeText>
                    <OttoWrap>
                        <img src="/assets/space-otter.png" alt="Otto" />
                    </OttoWrap>
                </WelcomeBar>

                {/* ── approval / onboarding banner ── */}
                <ApprovalBanner>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                        <ApprIcon>📋</ApprIcon>
                        <div>
                            <ApprTitle>
                                Complete your onboarding to unlock your full studio
                            </ApprTitle>
                            <ApprSub>
                                Your assistant is ready to guide you — takes less than 5 minutes
                            </ApprSub>
                        </div>
                    </div>
                    {onboardingChannel && studioServer ? (
                        <ApprBtn
                            as={Link}
                            to={`/server/${(studioServer as any)._id}/channel/${(onboardingChannel as any)._id}`}>
                            {assistantChannel ? "Chat with Otto →" : "Go to #start-here →"}
                        </ApprBtn>
                    ) : (
                        <ApprBtn disabled style={{ opacity: 0.5 }}>
                            Setting up…
                        </ApprBtn>
                    )}
                </ApprovalBanner>

                {/* ── 4-card wins ── */}
                <WinsBar>
                    <WinCard $color="#FFA03C">
                        <WinLabel>Books Sold · This Month</WinLabel>
                        <WinNumber $color="#FFA03C">—</WinNumber>
                        <WinDelta style={{ color: "var(--secondary-foreground)" }}>
                            Data available once live
                        </WinDelta>
                        <MorePill $color="#FFA03C">Full analytics →</MorePill>
                    </WinCard>
                    <WinCard $color="#60a5fa">
                        <WinLabel>Total Followers</WinLabel>
                        <WinNumber $color="#60a5fa">—</WinNumber>
                        <WinDelta style={{ color: "var(--secondary-foreground)" }}>
                            Connect platforms to track
                        </WinDelta>
                        <MorePill $color="#60a5fa">Platform breakdown →</MorePill>
                    </WinCard>
                    <WinCard $color="#4ade80">
                        <WinLabel>Posts Live · This Week</WinLabel>
                        <WinNumber $color="#4ade80">—</WinNumber>
                        <WinDelta style={{ color: "var(--secondary-foreground)" }}>
                            Posts go live after onboarding
                        </WinDelta>
                        <MorePill $color="#4ade80">View calendar →</MorePill>
                    </WinCard>
                    <WinCard $color="#f472b6">
                        <WinLabel>Ad Performance · This Month</WinLabel>
                        <WinNumber $color="#f472b6">—</WinNumber>
                        <WinDelta style={{ color: "var(--secondary-foreground)" }}>
                            Ad data appears once campaigns run
                        </WinDelta>
                        <MorePill $color="#f472b6">View campaigns →</MorePill>
                    </WinCard>
                </WinsBar>

                {/* ── mid 3-col ── */}
                <MidGrid>
                    {/* Messages */}
                    <Card $accent="var(--accent)">
                        <CardTitle>Messages</CardTitle>
                        <MsgRow>
                            <MsgAv $bg="rgba(255,160,60,.18)" $color="var(--accent)">AP</MsgAv>
                            <MsgBody>
                                <MsgFrom>Your Apricotter Team <MsgNew>NEW</MsgNew></MsgFrom>
                                <MsgPreview>Welcome! Your studio is ready — let's get started.</MsgPreview>
                                <MsgTime>Just now</MsgTime>
                            </MsgBody>
                            <UnreadDot />
                        </MsgRow>
                        {studioServer && studioChannels.slice(0, 2).map((ch: any) => (
                            ch ? (
                                <MsgRow key={ch._id}>
                                    <MsgAv $bg="rgba(96,165,250,.12)" $color="#60a5fa">
                                        #{ch.name?.[0]?.toUpperCase() ?? "C"}
                                    </MsgAv>
                                    <MsgBody>
                                        <MsgFrom>#{ch.name}</MsgFrom>
                                        <MsgPreview>No messages yet</MsgPreview>
                                    </MsgBody>
                                </MsgRow>
                            ) : null
                        ))}
                        {studioServer && (
                            <MoreLink
                                as={Link}
                                to={`/server/${(studioServer as any)._id}`}>
                                View all channels →
                            </MoreLink>
                        )}
                    </Card>

                    {/* Blog & Posts */}
                    <Card $accent="#a78bfa">
                        <CardTitle $color="#a78bfa">Blog & Education Posts</CardTitle>
                        <BlogItem>
                            <BlogIcon>✍️</BlogIcon>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <BlogTitle>Your first post will appear here</BlogTitle>
                                <BlogMeta>Generated after onboarding · Pending</BlogMeta>
                            </div>
                        </BlogItem>
                        <BlogItem>
                            <BlogIcon>📚</BlogIcon>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <BlogTitle>SEO blog posts from your books</BlogTitle>
                                <BlogMeta>Ready once content pipeline runs</BlogMeta>
                            </div>
                        </BlogItem>
                        <BlogItem>
                            <BlogIcon>🎓</BlogIcon>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <BlogTitle>Reader guides & author stories</BlogTitle>
                                <BlogMeta>Coming soon</BlogMeta>
                            </div>
                            <BadgeBlue>Preview</BadgeBlue>
                        </BlogItem>
                    </Card>

                    {/* Ad Campaigns */}
                    <Card $accent="#f472b6">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                            <CardTitle $color="#f472b6" style={{ marginBottom: 0 }}>Ad Campaigns</CardTitle>
                            <Chip $v="orange">Coming Soon</Chip>
                        </div>
                        <AdItem>
                            <AdPlatform style={{ background: "rgba(24,119,242,.15)" }}>📘</AdPlatform>
                            <div style={{ flex: 1 }}>
                                <AdName>Facebook Campaign</AdName>
                                <AdMeta>Set up after onboarding · Targeting TBD</AdMeta>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <AdSpend $color="var(--secondary-foreground)">—</AdSpend>
                                <AdLive style={{ background: "rgba(255,160,60,.1)", color: "var(--accent)", borderColor: "rgba(255,160,60,.25)" }}>Pending</AdLive>
                            </div>
                        </AdItem>
                        <AdItem>
                            <AdPlatform style={{ background: "rgba(225,48,108,.15)" }}>📸</AdPlatform>
                            <div style={{ flex: 1 }}>
                                <AdName>Instagram Campaign</AdName>
                                <AdMeta>Set up after onboarding · Targeting TBD</AdMeta>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <AdSpend $color="var(--secondary-foreground)">—</AdSpend>
                                <AdApproveBtn>Set Up →</AdApproveBtn>
                            </div>
                        </AdItem>
                        <AdItem>
                            <AdPlatform style={{ background: "rgba(29,155,240,.15)" }}>🐦</AdPlatform>
                            <div style={{ flex: 1 }}>
                                <AdName>X / Twitter Campaign</AdName>
                                <AdMeta>Set up after onboarding · Targeting TBD</AdMeta>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <AdSpend $color="var(--secondary-foreground)">—</AdSpend>
                                <AdApproveBtn>Set Up →</AdApproveBtn>
                            </div>
                        </AdItem>
                        <MoreLink>View all campaigns →</MoreLink>
                    </Card>
                </MidGrid>

                {/* ── bottom 2-col ── */}
                <BotGrid>
                    {/* Content Library */}
                    <Card $accent="var(--accent)">
                        <CardTitle>Content Library</CardTitle>
                        <BookRow>
                            <BookThumb $bg="rgba(255,160,60,.12)" $border="rgba(255,160,60,.2)">📕</BookThumb>
                            <div style={{ flex: 1 }}>
                                <BookTitle>Upload your first book</BookTitle>
                                <BookSeries>Supported: PDF · EPUB · TXT · DOCX</BookSeries>
                            </div>
                            <ActiveBadge style={{ background: "rgba(255,160,60,.1)", color: "var(--accent)", borderColor: "rgba(255,160,60,.2)" }}>
                                Pending
                            </ActiveBadge>
                        </BookRow>
                        <BookRow>
                            <BookThumb $bg="rgba(96,165,250,.1)" $border="rgba(96,165,250,.2)">📗</BookThumb>
                            <div style={{ flex: 1 }}>
                                <BookTitle>Book 2 slot</BookTitle>
                                <BookSeries>Add more books to grow your pipeline</BookSeries>
                            </div>
                        </BookRow>
                        <BookRow>
                            <BookThumb $bg="rgba(167,139,250,.1)" $border="rgba(167,139,250,.2)">📘</BookThumb>
                            <div style={{ flex: 1 }}>
                                <BookTitle>Book 3 slot</BookTitle>
                                <BookSeries>No limit on books in your library</BookSeries>
                            </div>
                        </BookRow>
                        <MoreLink>Manage library →</MoreLink>
                    </Card>

                    {/* EIM + Media Assets stacked */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <EimBtn>
                            <span style={{ fontSize: 24 }}>✍️</span>
                            <div>
                                <EimTitle>Help me write gooder</EimTitle>
                                <EimSub>Editorial Intelligence Module — AI writing assistant</EimSub>
                            </div>
                            <span style={{ fontSize: 18, color: "rgba(167,139,250,.5)" }}>→</span>
                        </EimBtn>

                        <Card $accent="#60a5fa" style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
                                <CardTitle $color="#60a5fa" style={{ marginBottom: 0 }}>Media Assets</CardTitle>
                                <span style={{ fontSize: 9, color: "var(--secondary-foreground)" }}>0 files</span>
                            </div>
                            <AssetGrid>
                                {[["📸","Author Photo"],["🖼️","Book Covers"],["🎬","Video Clips"],["🎙️","Voiceovers"],["🎨","Brand Kit"],["📄","Press Kit"]].map(([icon, lbl]) => (
                                    <AssetTile key={lbl}>
                                        <span>{icon}</span>
                                        <TileLbl>{lbl}</TileLbl>
                                    </AssetTile>
                                ))}
                                <AssetTile $dashed>
                                    <span style={{ color: "var(--accent)", fontSize: 20 }}>＋</span>
                                    <TileLbl style={{ color: "var(--accent)" }}>Upload</TileLbl>
                                </AssetTile>
                                <AssetTile>
                                    <span>📁</span>
                                    <TileLbl>All Files</TileLbl>
                                </AssetTile>
                            </AssetGrid>
                        </Card>
                    </div>
                </BotGrid>

                {/* ── account row ── */}
                <Card $accent="var(--accent)">
                    <AccountGrid>
                        <div>
                            <CardTitle>My Account</CardTitle>
                            <AcctRow><AcctLabel>Name</AcctLabel><AcctVal>{username}</AcctVal><AcctEdit>Edit</AcctEdit></AcctRow>
                            <AcctRow><AcctLabel>Plan</AcctLabel><AcctVal>Onboarding</AcctVal><AcctEdit>View</AcctEdit></AcctRow>
                            <AcctRow><AcctLabel>Next billing</AcctLabel><AcctVal>—</AcctVal><AcctEdit>Manage</AcctEdit></AcctRow>
                            <AcctRow><AcctLabel>Account Manager</AcctLabel><AcctVal>Apricotter Team</AcctVal><AcctEdit>Message</AcctEdit></AcctRow>
                        </div>
                        <VDiv aria-hidden />
                        <div>
                            <CardTitle $color="#60a5fa">Active Platforms</CardTitle>
                            {[["#1d9bf0","X / Twitter"],["#e1306c","Instagram"],["#1877f2","Facebook"],["#ff0050","TikTok"],["#0a66c2","LinkedIn"],["#0085ff","BlueSky"]].map(([c,n]) => (
                                <PlatRow key={n}>
                                    <PDot $c={c} />
                                    <PName>{n}</PName>
                                    <SPend>Pending</SPend>
                                </PlatRow>
                            ))}
                        </div>
                        <VDiv aria-hidden />
                        <div>
                            <CardTitle>Otto Support</CardTitle>
                            <OttoSupport>
                                <OttoImg src="/assets/space-otter.png" alt="Otto" />
                                <OttoBubble>Hi {firstName}! Got questions?<br />I'm right here.</OttoBubble>
                                {onboardingChannel && studioServer ? (
                                    <ChatBtn
                                        as={Link}
                                        to={`/server/${(studioServer as any)._id}/channel/${(onboardingChannel as any)._id}`}>
                                        {assistantChannel ? "Chat with Otto" : "Go to #start-here"}
                                    </ChatBtn>
                                ) : (
                                    <ChatBtn as="button" disabled style={{ opacity: 0.5 }}>
                                        Setting up…
                                    </ChatBtn>
                                )}
                            </OttoSupport>
                        </div>
                    </AccountGrid>
                </Card>
            </Inner>
        </Wrap>
    );
});
