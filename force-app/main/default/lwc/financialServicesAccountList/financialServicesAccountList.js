import { LightningElement, wire, track } from 'lwc';
import searchAccount from '@salesforce/apex/FsAccounts.searchAccount'
import allFsAccounts from '@salesforce/apex/FsAccounts.allFsAccounts'
import { refreshApex } from '@salesforce/apex'
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import { updateRecord  } from 'lightning/uiRecordApi'
const COLS=[
    {label:'Account Name', fieldName:'Name', editable:true, sortable: "true"},
    {label:'Phone', fieldName:'Phone',  type:"phone",   sortable: "false" , editable:true},
    {label:'Website', fieldName:'Website',  type:"url",    sortable: "false", editable:true},
    {label:'Annual Revenue', fieldName:'AnnualRevenue', sortable: "false", editable:true},
    {label:'Account Owner', fieldName:'OwnerName', sortable: "true"},
    { label: 'Name', fieldName: 'accountIdForURL', type: 'url', 
    typeAttributes: { label: { fieldName: 'Name' }, target: '_blank' }, editable:true }
]
export default class FinancialServicesAccountList extends LightningElement {
    @track accountsList = [];
    @track filteredAccounts = []
    columns = COLS
    draftValues=[]
    @track sortBy
    @track sortDirection
    @wire(allFsAccounts)
    fsAccountsData({data, error})
    {
        if(data)
        {
            console.log(data)
            let tempAccList = [];
            data.forEach((record)=>{
                let tempAccRec = Object.assign({}, record);
                tempAccRec.OwnerName =  record.Owner.Name;
                tempAccRec.accountIdForURL = '/' + record.Id;
                tempAccList.push(tempAccRec);
            })
            this.accountsList = tempAccList
            this.filteredAccounts = tempAccList
        }
        if(error)
        {
            console.log(error)
        }
    }

    onkeyupHandler(event)
    {
        console.log(event.target.value)
        let src = event.target.value
        this.filteredAccounts = []
        let accf = this.accountsList.map(item=> {
        if(item.Name.includes(src)){
            this.filteredAccounts.push(item)
        }
        })
    }
    handleSave(event){
        console.log(JSON.stringify(event.detail.draftValues))
        const recordInputs=event.detail.draftValues.map(draft=>{
            const fields = {...draft};
            return { fields:fields };
        })
        const promises = recordInputs.map(recordInput=>updateRecord(recordInput))
        Promise.all(promises).then(()=>{
            console.log('Account updated Successfully')
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Account updated',
                    variant: 'success'
                })
            )
           this.draftValues = [];
           return this.refresh();
        }).catch(error=>{
            console.error("Error updating the record", error)
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating record',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        })
        
    }
    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }
    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.filteredAccounts));
        let keyValue = (a) => {
            return a[fieldname];
        };
        let isReverse = direction === 'asc' ? 1: -1;
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; 
            y = keyValue(y) ? keyValue(y) : '';
            return isReverse * ((x > y) - (y > x));
        });
        this.filteredAccounts = parseData;
    }
    async refresh()
    {
        await refreshApex(this.accountsList);
    }
}