import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';

import * as strings from 'TestWebPartWebPartStrings';
import TestWebPart from './components/TestWebPart';
import { ITestWebPartProps } from './components/ITestWebPartProps';
import { sp } from "@pnp/sp";

export interface ITestWebPartWebPartProps {
  description: string;
}

export default class TestWebPartWebPart extends BaseClientSideWebPart<ITestWebPartWebPartProps> {

  public render(): void {
    const element: React.ReactElement<ITestWebPartProps > = React.createElement(
      TestWebPart,
      {
        description: this.properties.description,
        context: this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

public onInit(): Promise<void> {

  return super.onInit().then(_ => {

    // other init code may be present

    sp.setup({
      spfxContext: this.context
    });
  });
}

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
