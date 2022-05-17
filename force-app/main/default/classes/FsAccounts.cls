public with sharing class FsAccounts {
    @AuraEnabled(cacheable=true)
    public static List<Account> searchAccount(String searchkey){
       String key = '%' + searchkey + '%';
        return [select  Id, Name, Owner.Name, Phone, Website, AnnualRevenue from Account 
        WHERE Name like : key];
        }   
    @AuraEnabled(cacheable=true)
    public static List<Account> allFsAccounts(){
        return [select  Id, Name, Owner.Name, Phone, Website, AnnualRevenue from Account 
        WHERE Industry = 'Financial Services'];
        } 
        
}