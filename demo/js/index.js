$(document).ready(() => {

    /**
     * Initializing contract API
     */
    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:8545"));
    }

    var reenrolmentContract;
   
    var accountAddress;
    web3.eth.getAccounts().then(arr=>{
        accountAddress = arr[0];
       
        reenrolmentContract = new web3.eth.Contract(abi, contractAddress, {from:accountAddress}); 
        console.log(reenrolmentContract);
        console.log(accountAddress);
    });
    ///////////////////////////////////////////////////////////////////////////////
    ///////////////////////////  End of Initialization  ///////////////////////////
    ///////////////////////////////////////////////////////////////////////////////
    
    //hide all views
    $('#notificationAlert').hide(1);
    $('.institution').hide(10);
    $('.student').hide(10);
    $('#account-data').hide(1);

    $('#btn-notification').click(()=>{
        $('#notificationAlert').hide(1);
    });

    var account;
    $('#btn-pkey').click(() =>{
        var pkey = $('#pkey').val();
        account = web3.eth.accounts.privateKeyToAccount(pkey);
      
        $("#account-no").text(account.address);
        updateBalance();

        $('#login').hide(1);
        $('#account-data').show();

        if(account.address == accountAddress){
            initInstitution();
            $('.institution').show();
        }else{
            initStudent();
            $('.student').show();
        }
    });


    function getLastSemesterData(callback){
        reenrolmentContract.methods.nextSemester().call({gas:300000}, (err,res)=>{
            if(err){
                console.error(err);
            }else if(res){
                console.log(res);
                callback(res);
            }
        });
    }

    /**
     * Code for institution view
     */
    function initInstitution(){
        feePaidEvent();

        getLastSemesterData(semester=>{
            retrieveNextSemesterTbl(semester.term, semester.year, semester.abbreviation, semester.tuitionFee);
        });

        //set visibility of elements
        $('#form-register').hide(10);
        $('#table').hide(10);

        //initialize click events
        $('#btn-show-register').click(()=>{
            $('#form-register').show();
            $('#btn-show-register').hide(10);
        });

        $('#btn-register').click(()=>{
            var term = $('#term').val();
            var year = $('#year').val();
            var tfee = $('#tfee').val();
            var abbrv = $('#abbrv').val();

            retrieveNextSemesterTbl(term, year, abbrv, tfee);   
            $('#btn-show-register').show();            
        });
    }

    function retrieveNextSemesterTbl(term, year, abbrv, tfee){
        reenrolmentContract.methods.registerNewSemesterTerm(term, year, abbrv, tfee)
                .send({
                    from:account.address,
                    gas: 300000
                }, (err, trx)=>{
                    if(err){
                        console.error(err);
                    }
                    if(trx){
                        console.log(trx);
                    }
                    updateBalance();
                }).then(()=>{

                    getLastSemesterData((response)=>{
                        $('#table').show();
                        $('#form-register').hide(10);
                        //fill table
                        var entry = "<tr><th>"+response[2]+"</th><td>"+response[0]+"</td><td>"+response[1]
                                        +"</td><td>"+response[3]+"</td></tr>";
                        $('#tbody').empty();                                        
                        $('#tbody').append(entry);
                    });
        }); 
    }

    /**
     * Code for student view
     */

    function initStudent(){
        listenToEvents();

        $('#user-group').text("Student");
        $('#table-student').hide(10);
        $('#receipt').hide(10);
        $('#form-registration').hide(10);
        $('#btn-register-student').click(()=>{

            if($('#name').val().length == 0 && $('#matr').val().length == 0){
                return;
            }

            // register into the system
            reenrolmentContract.methods.register($('#name').val(), $('#matr').val())
                    .send({from:account.address, gas: 300000}, (err,res)=>{
                        if(!err){
                            $('#form-registration').hide();
                            retrieveStudentTable();
                            updateBalance();
                        }
                    });
        });
        retrieveStudentTable();
    }

    function retrieveStudentTable(){
        // retrieve last semester
        getLastSemesterData((response)=>{
            var abbrv = response[2];
            var enrolled = false;
            // check if student enrolled for last semester
            reenrolmentContract.methods.getStudent().call({from:account.address, gas:300000}, (err,resp)=>{
                if(err){
                    // student is not registered yet
                    console.error(err);
                    $('#form-registration').show();

                }else if(resp){
                    console.log(resp);
                    updateBalance();
                    // change status accordingly 
                    if(resp[2] != abbrv){
                        enrolled = false;
                    }else{
                        enrolled = true;
                    }
                    
                    updateStudentTable(response, enrolled);
                    $('#table-student').show();
                }
            });
        });      
        
    }

    function prettyPrint(json) {
        if (typeof json != 'string') {
             json = JSON.stringify(json, undefined, 2);
        }
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    function listenToEvents(){
        var alert = function(message){
            $('#notification').text(message);
            $('#notificationAlert').show();
        };

        var update = function(message){
            alert(message);
            getLastSemesterData((semester)=>{
                updateStudentTable(semester, false);
            });
            $('#receipt').empty();
            $('#receipt').hide(1);
        }
        
        reenrolmentContract.events.Notify((error,ev)=>{
            if(!error){
                console.log(ev.returnValues.message);
                update(ev.returnValues.message);
            }
            
        }).on('changed', ev=>{
            console.log(ev.returnValues.message);
            update(ev.returnValues.message);
        });
    }

    function feePaidEvent(){
        reenrolmentContract.events.FeePaid((error,ev)=>{
            if(!error){
                console.log("fee received!");
                updateBalance();
            }
        });
    }

    function updateBalance(){
        web3.eth.getBalance(account.address, (error, wei)=>{
            if(!error){
                var balance = web3.utils.fromWei(wei, 'ether');
                $('#balance').text(balance+" ETH");
            }
        });
    }

    function updateStudentTable(semester, isEnrolled){

        if(semester.year == 0){

            // TODO show that there is no open Re-Enrollment period

        }else{
            var status = isEnrolled ? 'enrolled' : 'not enrolled';
            var entry = "<tr><th>"+semester.abbreviation+"</th><td>"+semester.term+"</td><td>"+semester.year
                        +"</td><td>"+semester.tuitionFee+"</td><td>"+status+"</td>";
        
            if(!isEnrolled){
                entry += "<td><button id='btn-enrol' class='btn btn-secondary'>Re-enrol</button></td></tr>";
            }else{
                entry+= "<td></td></tr>"
            }
            $('#tbody2').empty();
            $('#tbody2').append(entry);

            $('#btn-enrol').click(()=>{
                reenrolmentContract.methods.enrol().send({from:account.address, value:semester.tuitionFee, gas:300000}, (fail, success)=>{
                    if(fail){
                        console.error(fail);
                    }else if(success){
                        // change table state
                        updateStudentTable(semester, true);
                        
                        // return receipt
                        web3.eth.getTransactionReceipt(success, (err,result)=>{
                            if(!err){
                                var receipt = prettyPrint(result);
                                $('#receipt').append("<pre><code>"+receipt+"</code></pre>").show();
                            }
                        });                      
                        
                        updateBalance();
                    }
                });
            });
        }        
    }

});