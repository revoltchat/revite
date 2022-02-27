import Tip from "../../../components/ui/Tip";
import Button from "../../ui/Button";

interface Props {
    save: () => void;
}

export function UnsavedChanges({ save }: Props) {
    return (
        <Tip hideSeparator>
            <span
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                }}>
                You have unsaved changes!
                <Button onClick={save}>Save</Button>
            </span>
        </Tip>
    );
}
