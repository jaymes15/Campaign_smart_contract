pragma solidity ^0.4.17;

contract CampaignFactory{
    address[] public deployedCampaigns;

    function createCampaign(uint minimum) public{
        address newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(newCampaign);
    }

    function getDeployedCampaigns() public view returns(address[]){
        return deployedCampaigns;
    }
}


contract Campaign{
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
    }

    Request[] public requests;
    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public approvers;
    uint public approvalCount;


    modifier validateMinimumContribution(){
        require(msg.value >= minimumContribution);
        _;
    }

    modifier validateSenderIsManager(){
        require(msg.sender == manager);
        _;
    }

    function Campaign(uint minimum, address creator) public {
        manager = creator;
        minimumContribution = minimum;
    }

    function contribute() public payable validateMinimumContribution{
        approvers[msg.sender] = true;
        approvalCount++;
    }

    function createRequest(string description, uint value, address recipient)
        public validateSenderIsManager{
            require(address(this).balance >= value);
            Request memory newRequest = Request({
                description: description,
                value: value,
                recipient: recipient,
                complete: false,
                approvalCount: 0
            });

            requests.push(newRequest);
    }

    function approveRequest(uint index) public{
        Request storage request = requests[index];

        require(approvers[msg.sender]);
        require(!request.approvals[msg.sender]);

        request.approvals[msg.sender] = true;
        request.approvalCount++;

    }


    function finalizeRequest(uint index) public validateSenderIsManager{

        Request storage request = requests[index];

        require(!request.complete);
        require(request.approvalCount > approvalCount/2);

        request.recipient.transfer(request.value);
        request.complete = true;


    }


}
