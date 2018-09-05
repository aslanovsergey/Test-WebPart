import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import {
    DialogFooter,
    DialogContent
} from 'office-ui-fabric-react';
import { Button, PrimaryButton } from "office-ui-fabric-react/lib/Button";

export interface DeleteCofrimationDialogContentProps {
    message: string
    close: () => Promise<void>
    submit: () => void;
}

export class DeleteCofrimationDialogContent extends React.Component<DeleteCofrimationDialogContentProps> {

    public render(): JSX.Element {
        return (
            <DialogContent
                title="Delete item"
                subText={this.props.message}
                onDismiss={this.props.close}
                showCloseButton={true}
            >
                <DialogFooter>
                    <Button text='Cancel' title='Cancel' onClick={this.props.close} />
                    <PrimaryButton text='OK' title='OK' onClick={() => this.props.submit()} />
                </DialogFooter>
            </DialogContent>
        )
    }
}

export class DeleteCofrimationDialog extends BaseDialog {
    constructor(private message: string, private callback: () => void) {
        super();
        this.callback = callback;
    }

    public render(): void {
        ReactDOM.render(<DeleteCofrimationDialogContent
            close={this.close}
            message={this.message}
            submit={this._submit}
        />, this.domElement);
    }

    public getConfig(): IDialogConfiguration {
        return {
            isBlocking: false
        };
    }

    private _submit = (): void => {
        this.callback();
        this.close();
    }
}