import styled, { createGlobalStyle } from 'styled-components';
import { useState } from 'preact/hooks';

import { Button } from './components/ui/Button';
import { Banner } from './components/ui/Banner';
import { Checkbox } from './components/ui/Checkbox';
import { ComboBox } from './components/ui/ComboBox';
import { InputBox } from './components/ui/InputBox';

// ! TEMP START
let a = {"light":false,"accent":"#FD6671","background":"#191919","foreground":"#F6F6F6","block":"#2D2D2D","message-box":"#363636","mention":"rgba(251, 255, 0, 0.06)","success":"#65E572","warning":"#FAA352","error":"#F06464","hover":"rgba(0, 0, 0, 0.1)","sidebar-active":"#FD6671","scrollbar-thumb":"#CA525A","scrollbar-track":"transparent","primary-background":"#242424","primary-header":"#363636","secondary-background":"#1E1E1E","secondary-foreground":"#C8C8C8","secondary-header":"#2D2D2D","tertiary-background":"#4D4D4D","tertiary-foreground":"#848484","status-online":"#3ABF7E","status-away":"#F39F00","status-busy":"#F84848","status-streaming":"#977EFF","status-invisible":"#A5A5A5"};

const GlobalTheme = createGlobalStyle`
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

export const UIDemo = styled.div`
	gap: 12px;
	padding: 12px;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
`;

export function App() {
	let [checked, setChecked] = useState(false);

	return (
		<>
			<GlobalTheme />
			<UIDemo>
				<Button>Button (normal)</Button>
				<Button contrast>Button (contrast)</Button>
				<Button error>Button (error)</Button>
				<Button contrast error>Button (contrast + error)</Button>
				<Banner>I am a banner!</Banner>
				<Checkbox checked={checked} onChange={setChecked} description="ok gamer">Do you want thing??</Checkbox>
				<ComboBox>
					<option>Select an option.</option>
					<option>1</option>
					<option>2</option>
					<option>3</option>
				</ComboBox>
				<InputBox placeholder="Normal input box..." />
				<InputBox placeholder="Contrast input box..." contrast />
				<InputBox value="Input box with value" />
				<InputBox value="Contrast with value" contrast />
			</UIDemo>
		</>
	)
}
	