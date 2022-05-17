public with sharing class AccountController {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccountList(){
        return [select Id, Name, Type, Industry from Account LIMIT 5];
        }
    @AuraEnabled(cacheable=true)
    public static List<Account> filterAccountList(String type){
        return [select Id, Name, Type, Industry from Account where Type=:type LIMIT 5];
        }
    
        @AuraEnabled(cacheable=true)
        public static List<Account> searchAccount(String searchkey){
           String key = '%' + searchkey + '%';
            return [select Id, Name, Type, Industry from Account 
            WHERE Name like : key LIMIT 5];
            }    
    }
