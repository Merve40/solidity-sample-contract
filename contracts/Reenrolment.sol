pragma solidity >= 0.4.22 < 0.6.0;

contract Reenrolment {

    event Notify(string message);
    event FeePaid(string message);

    struct Semester {
        string term; //summer or winter
        uint year;
        string abbreviation; // ex. W18 or S19
        uint tuitionFee; //in wei currency
    }

    struct Student {
        string name;
        uint matriculationNo;
        string lastEnrolledSemester;
    }

    address payable institution; // contract owner
    mapping(address => Student) students; 
    
    Semester public nextSemester;

    modifier onlyOwner(){
        require(msg.sender == institution, "Only the contract owner is allowed to access this function");
        _;
    }

    modifier canPay(){
        require(msg.value == nextSemester.tuitionFee, "Student does not have enough balance or is not paying the correct amount");
        _;
    }
    
    constructor() public {
        institution = msg.sender;
    }

    function getStudent() public view returns (string memory, uint, string memory){
        require(bytes(students[msg.sender].name).length > 0, "Student has never enrolled before, thus is not registered in the system.");
        return (students[msg.sender].name, students[msg.sender].matriculationNo, 
                    students[msg.sender].lastEnrolledSemester);        
    }

    function register(string memory _name, uint matriculation) public{
        // if student is already enrolled then stop
        require(bytes(students[msg.sender].name).length == 0, "Student is already registered in the system.");
       
        //register student
        if(bytes(_name).length != 0 && matriculation > 0){
            students[msg.sender].name = _name;
            students[msg.sender].matriculationNo = matriculation;
            students[msg.sender].lastEnrolledSemester = "";
        }                    
    }

    function enrol() canPay public payable{
        //if student is not enrolled then stop
        require(bytes(students[msg.sender].name).length > 0,"Student is not registered yet");
    
        // if student already re-enrolled then stop
        string memory lastEnrolled = students[msg.sender].lastEnrolledSemester;
        string memory nextSem = nextSemester.abbreviation;
        require(!stringCompare(students[msg.sender].lastEnrolledSemester, nextSemester.abbreviation),
                                "Student has already re-enrolled");

        //transfer ether from contract to institutions account
        institution.transfer(msg.value);

        //re-enrol
        students[msg.sender].lastEnrolledSemester = nextSemester.abbreviation;
        emit FeePaid("Student transferred tuition fee.");
    }

    function registerNewSemesterTerm(string memory _term, uint _year, string memory _abbrv, uint _tuition) public onlyOwner{
        
        if(!stringCompare(nextSemester.abbreviation, _abbrv)){
            if(nextSemester.year == 0){
                nextSemester = Semester(_term, _year, _abbrv, _tuition);
            }else{
                nextSemester.term = _term;
                nextSemester.year = _year;
                nextSemester.abbreviation = _abbrv;
                nextSemester.tuitionFee = _tuition;
            }
            emit Notify("Re-enrollment period for the next semester has started"); 
        }
    }
    
    function stringCompare(string memory a, string memory b) internal returns (bool) {
        if(bytes(a).length != bytes(b).length) {
            return false;
        } else {
            return keccak256(bytes(a)) == keccak256(bytes(b));
        }
    }

    function() external payable{}
}