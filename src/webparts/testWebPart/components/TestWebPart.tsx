import * as React from 'react';
import styles from './TestWebPart.module.scss';
import { ITestWebPartProps } from './ITestWebPartProps';
import { escape, keys } from '@microsoft/sp-lodash-subset';
import { CommandBar, ICommandBarProps, ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { Pivot, PivotItem, DetailsList, IColumn, DetailsRow, IDetailsRowProps, IDetailsRowCheckProps, SelectionMode, IObjectWithKey, Selection, DatePicker, IDatePickerStrings, Dropdown, IDropdown, IDatePicker, TextField } from 'office-ui-fabric-react';
import { ITestWebPartState } from './ITestWebPartState';
import { sp, ItemVersion, AttachmentFileInfo } from "@pnp/sp";
import { Dialog } from '@microsoft/sp-dialog';
import { DeleteCofrimationDialog } from './deleteCofrimationDialog';
import { PeoplePicker } from "@pnp/spfx-controls-react/lib/PeoplePicker";

const DayPickerStrings: IDatePickerStrings = {
  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ],

  shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

  shortDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],

  goToToday: 'Go to today',
  prevMonthAriaLabel: 'Go to previous month',
  nextMonthAriaLabel: 'Go to next month',
  prevYearAriaLabel: 'Go to previous year',
  nextYearAriaLabel: 'Go to next year'
};

export default class TestWebPart extends React.Component<ITestWebPartProps, ITestWebPartState> {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      selectedItems: [],
      editMode: false,
      currentUser: { DisplayName: "", Title: "" }
    }
  }

  private rooms = [
    { key: 'A', text: 'Tallinn' },
    { key: 'B', text: 'Berlin' },
    { key: 'C', text: 'London' }
  ]

  private datePicker;
  private dropDown;
  private title;
  public assistant;

  private getListItems = (): Promise<any[]> => {
    return sp.web.lists.getByTitle("Test WebPart List").items.select("ID", "Title", "MeetingDate", "MeetingRoom", "Assistant/Id", "Assistant/Title", "Assistant/EMail").expand("Assistant").get().then(response => {
      console.log(response);
      return response.map(item => ({ id: item.ID, title: item.Title, MeetingDate: new Date(item.MeetingDate), MeetingRoom: item.MeetingRoom, assistant: item.Assistant, attachments: [] }))
    })
  }

  private getListItemsAndSetState = (): Promise<any[]> => {
    return this.getListItems()
      .then(items => {
        this.setState({
          items
        })
        return items;
      })
  }

  private getAttachments = (items: any[]) => {
    let batch = sp.createBatch();

    items.forEach(item =>
      sp.web.lists.getByTitle("Test WebPart List").items.getById(item.id).inBatch(batch).attachmentFiles.get().then(r => {
        console.log(r);
        let newItems = this.state.items.map(newItem => {
          if (newItem.id === item.id) {
            newItem.attachments = [];
            r.forEach(attachment => item.attachments.push(attachment.FileName))
          }
          return newItem
        });
        this.setState({
          items: newItems
        })
      }))

    batch.execute().then(() => console.log("All done!"));
  }

  componentWillMount() {
    sp.profiles.myProperties.get().then(d => {
      console.log(d);
      this.setState({
        currentUser: {
          DisplayName: d.DisplayName,
          Title: d.Title
        }
      })
    });

    this.getListItemsAndSetState()
      .then(items => this.getAttachments(items))
  }


  public render(): React.ReactElement<ITestWebPartProps> {
    return (
      <div>
        <CommandBar
          items={this._getCommandBarItems()}
          farItems={this._getCommandBarFarItems()}
        />
        <div>
          <Pivot
            onLinkClick={this.onPivotLinkClick}
          >
            <PivotItem linkText="Meeting date">
              <DetailsList
                items={this.state.items}
                selectionMode={SelectionMode.single}
                selection={this._selection}
                columns={
                  [
                    {
                      key: 'title',
                      name: 'Title',
                      fieldName: 'title',
                      minWidth: 100,
                      maxWidth: 200,
                      isResizable: true
                    },
                    {
                      key: 'MeetingDate',
                      name: 'Meeting Date',
                      fieldName: 'MeetingDate',
                      minWidth: 100,
                      maxWidth: 200
                    }
                  ]
                }
                // onRenderItemColumn={_renderItemColumn}
                onRenderRow={this._onRenderRow}
              />
            </PivotItem>
            <PivotItem linkText="Meeting room">
              <DetailsList
                items={this.state.items}
                selectionMode={SelectionMode.single}
                selection={this._selection}
                columns={
                  [
                    {
                      key: 'title',
                      name: 'Title',
                      fieldName: 'title',
                      minWidth: 100,
                      maxWidth: 200,
                      isResizable: true
                    },
                    {
                      key: 'MeetingRoom',
                      name: 'Meeting Room',
                      fieldName: 'MeetingRoom',
                      minWidth: 100,
                      maxWidth: 200
                    }
                  ]
                }
                // onRenderItemColumn={_renderItemColumn}
                onRenderRow={this._onRenderRow}
              />
            </PivotItem>
            <PivotItem linkText="Assistant">
              <DetailsList
                items={this.state.items}
                selectionMode={SelectionMode.single}
                selection={this._selection}
                columns={
                  [
                    {
                      key: 'title',
                      name: 'Title',
                      fieldName: 'title',
                      minWidth: 100,
                      maxWidth: 200,
                      isResizable: true
                    },
                    {
                      key: 'assistant',
                      name: 'Assistant',
                      fieldName: 'assistant',
                      minWidth: 100,
                      maxWidth: 200
                    },
                    {
                      key: 'attachments',
                      name: 'Attachments',
                      fieldName: 'attachments',
                      minWidth: 100,
                      maxWidth: 200
                    }
                  ]
                }
                // onRenderItemColumn={_renderItemColumn}
                onRenderRow={this._onRenderRow}
              />
            </PivotItem>
          </Pivot>
        </div>
      </div>
    );
  }

  private onPivotLinkClick = (item: PivotItem, ev: React.MouseEvent<HTMLElement>) => {
    if (item.props.linkText === "Meeting date") {

    }
  }

  private _selection = new Selection({
    onSelectionChanged: () => {
      let items: number[] = this._selection.getSelectedIndices()
      this.setState({
        selectedItems: items, editMode: false
      });
      this.resetRefs()
    }
  });

  private _renderItemColumn = (item: any, index: number, column: IColumn) => {
    console.log("_renderItemColumn")
    const fieldContent = item[column.fieldName || ''];

    switch (column.key) {
      case 'title':
        if (this.state.editMode && index === this.state.selectedItems[0]) {
          return (
            <TextField
              value={fieldContent}
              componentRef={input => this.title = input}
            />
          );
        } else {
          return (
            <span>{fieldContent}</span>
          );
        }
      case 'MeetingDate':
        if (this.state.editMode && index === this.state.selectedItems[0]) {
          return (
            <DatePicker
              strings={DayPickerStrings}
              placeholder="Select a date..."
              componentRef={input => this.datePicker = input}
              value={fieldContent}
              onSelectDate={() => console.log(this.datePicker)}
            />
          );
        } else {
          return (
            <DatePicker
              strings={DayPickerStrings}
              placeholder="Select a date..."
              value={fieldContent}
              disabled={true}
            />
          );
        }
      case "MeetingRoom":
        var selectedKeys = fieldContent !== null ? [this.rooms.find(item => item.text === fieldContent).key] : null;
        if (this.state.editMode && index === this.state.selectedItems[0]) {
          return (
            <Dropdown
              placeHolder="Select an Option"
              componentRef={input => this.dropDown = input}
              options={this.rooms}
              multiSelect={false}
              selectedKeys={selectedKeys}
            />
          );
        } else {
          return (
            <Dropdown
              placeHolder="Select an Option"
              options={this.rooms}
              multiSelect={true}
              selectedKeys={selectedKeys}
              disabled={true}
            />
          );
        }
      case "assistant":
        if (this.state.editMode && index === this.state.selectedItems[0]) {
          return (
            <PeoplePicker
              peoplePickerWPclassName={styles.peoplePickerWithoutTitle}
              titleText={null}
              context={this.props.context}
              personSelectionLimit={1}
              selectedItems={this._getPeoplePickerItems}
              defaultSelectedUsers={fieldContent ? [fieldContent.EMail] : null}
            />
          );
        } else {
          return (
            <span>{fieldContent.Title}</span>
          );
        }
      case "attachments":
        if (this.state.editMode && index === this.state.selectedItems[0]) {
          return (
            <div>
              {fieldContent.map(attachmentName => <div>{attachmentName}</div>)}
              <input type="file" id="uploadFiles" multiple /><br></br>
              <input type="button" value="Upload" onClick={this.UploadFiles} />
            </div>
          );
        } else {

          return (
            fieldContent.map(attachmentName => <div>{attachmentName}</div>)
          );
        }

      default:
        return <span>{fieldContent}</span>;
    }
  }

  private UploadFiles = (e): boolean => {
    e.preventDefault();
    var uplodFiles = (document.getElementById('uploadFiles') as HTMLInputElement);
    var files = uplodFiles.files;

    if (files.length > 0) {

      var fileInfos: AttachmentFileInfo[] = [];
      for (var i = 0; i < files.length; i++) {
        let file = files[i];

        fileInfos.push({
          name: file.name,
          content: file
        });
      }

      sp.web.lists.getByTitle("Test WebPart List").items.getById(this.state.items[this.state.selectedItems[0]].id).attachmentFiles.addMultiple(fileInfos).then((result) => {
        console.log(result);
        this.getAttachments([this.state.items[this.state.selectedItems[0]]]);
        uplodFiles.value = null;
      })
    }

    return false;
  }

  private _onRenderRow = (props: IDetailsRowProps): JSX.Element => {
    return <DetailsRow {...props} onRenderItemColumn={this._renderItemColumn} aria-busy={false} />;
  };

  private _onRenderCheck = (props: IDetailsRowCheckProps): JSX.Element => {
    return (
      <div
        role="button"
        aria-pressed={props.isSelected}
        data-selection-toggle={true}
      >
        <input type="checkbox" checked={props.isSelected} />
      </div>
    );
  };

  private _getCommandBarFarItems = (): ICommandBarItemProps[] => {
    return [
      {
        key: 'user',
        name: `${this.state.currentUser.DisplayName} (${this.state.currentUser.Title})`, //in later versions is replaced to text
      }
    ]
  }

  private _getPeoplePickerItems = (items: any[]) => {
    console.log(items);
    this.assistant = items[0];
  }

  private _getCommandBarItems = (): ICommandBarItemProps[] => {
    let items: ICommandBarItemProps[] = [
      {
        key: 'add',
        name: 'Add', //in later versions is replaced to text
        iconProps: { iconName: 'Add' },
        onClick: this.onAdd,
        iconOnly: false
      }
    ];

    if (this.state.selectedItems.length > 0) {
      items.push({
        key: 'delete',
        name: 'Delete', //in later versions is replaced to text
        iconProps: { iconName: 'Delete' },
        onClick: this.onDelete,
        disabled: false,
        iconOnly: false
      })
      if (!this.state.editMode)
        items.push({
          key: 'edit',
          name: 'Edit', //in later versions is replaced to text
          iconProps: { iconName: 'Edit' },
          onClick: () => this.setState({ editMode: true }),
          disabled: false,
          iconOnly: false
        })
      else
        items.push({
          key: 'save',
          name: 'Save', //in later versions is replaced to text
          iconProps: { iconName: 'Save' },
          onClick: this.onSave,
          disabled: false,
          iconOnly: false
        })
    }

    items.push({
      key: 'refresh',
      name: 'Refresh', //in later versions is replaced to text
      iconProps: { iconName: 'Refresh' },
      onClick: () => {
        this.getListItemsAndSetState()
          .then(items => this.getAttachments(items))
      },
      disabled: false,
      iconOnly: false
    })

    return items;
  }

  private onAdd = () => {
    sp.web.lists.getByTitle("Test WebPart List").items.add(
      {
        Title: ""
      }
    ).then(response => {
      console.log(response);
      return this.getListItemsAndSetState();
    }).then(items => this.getAttachments(items));
  }

  private onDelete = () => {
    this.deleteConfirmDialog();
  }

  private deleteConfirmDialog = () => {
    let message = `Do you want to delete selected element?`;
    let dialog = new DeleteCofrimationDialog(message,
      () => sp.web.lists.getByTitle("Test WebPart List").items.getById(this.state.items[this.state.selectedItems[0]].id).delete()
        .then(response => {
          console.log(response);
          return this.getListItemsAndSetState();
        }).then(items => this.getAttachments(items))
    );
    dialog.show();
  }

  private onSave = () => {
    console.log(this.title);
    console.log(this.datePicker);
    console.log(this.dropDown);
    console.log(this.assistant);

    let body = {}

    if (this.title && this.state.items[this.state.selectedItems[0]].title !== this.title.state.value)
      body["Title"] = this.title.state.value;

    if (this.datePicker && this.state.items[this.state.selectedItems[0]].MeetingDate !== this.datePicker.state.selectedDate)
      body["MeetingDate"] = this.datePicker.state.selectedDate;

    if (this.dropDown && this.dropDown.state.selectedIndices[0] !== -1 && this.state.items[this.state.selectedItems[0]].MeetingRoom !== this.rooms[this.dropDown.state.selectedIndices[0]].text)
      body["MeetingRoom"] = this.rooms[this.dropDown.state.selectedIndices[0]].text;

    if (this.assistant)
      if (!this.state.items[this.state.selectedItems[0]].assistant || this.state.items[this.state.selectedItems[0]].assistant.Id !== this.assistant.id)
        body["AssistantId"] = this.assistant.id;

    if (Object.keys(body).length > 0)
      sp.web.lists.getByTitle("Test WebPart List").items.getById(this.state.items[this.state.selectedItems[0]].id).update(
        body
      ).then(response => {
        console.log(response);
        return this.getListItemsAndSetState();
      }).then(() =>
        this.setState({ editMode: false })
      )
    else
      this.setState({ editMode: false });

    this.resetRefs();
  }

  private resetRefs = () => {
    this.title, this.datePicker, this.dropDown, this.assistant = null;
  }
}
