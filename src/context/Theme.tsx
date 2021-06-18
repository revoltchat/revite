import { createGlobalStyle } from "styled-components";

// ! TEMP START
let a = {"light":false,"accent":"#FD6671","background":"#191919","foreground":"#F6F6F6","block":"#2D2D2D","message-box":"#363636","mention":"rgba(251, 255, 0, 0.06)","success":"#65E572","warning":"#FAA352","error":"#F06464","hover":"rgba(0, 0, 0, 0.1)","sidebar-active":"#FD6671","scrollbar-thumb":"#CA525A","scrollbar-track":"transparent","primary-background":"#242424","primary-header":"#363636","secondary-background":"#1E1E1E","secondary-foreground":"#C8C8C8","secondary-header":"#2D2D2D","tertiary-background":"#4D4D4D","tertiary-foreground":"#848484","status-online":"#3ABF7E","status-away":"#F39F00","status-busy":"#F84848","status-streaming":"#977EFF","status-invisible":"#A5A5A5"};

export const GlobalTheme = createGlobalStyle`
:root {
	${
		Object.keys(a)
			.map(key => {
				return `--${key}: ${(a as any)[key]};`;
			})
	}
}
`;
// ! TEMP END
