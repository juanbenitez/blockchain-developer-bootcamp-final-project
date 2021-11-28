// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

// Helper functions OpenZeppelin provides.
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol"; 
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// import the helper functions from the contract Base64 contract library.
import { Base64 } from "./utils/Base64.sol";

/// @title Contract for deliver on-chain NFT certificates
/// @author Juan Benitez
/// @notice Allows a user to obtain NFT certificates for courses or skills.
/// @dev NFT data is saved fully on-chain, inherits from ERC721URIStorage (ERC721 OpenZeppelin NTF)
contract Certification is AccessControl, ERC721URIStorage{

  /// @dev Using counters from OpenZeppelin
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  /// @dev Define access roles, using AccessControl contract (OpenZeppelin)
  bytes32 public constant TUTOR = keccak256("TUTOR");
  bytes32 public constant STUDENT = keccak256("STUDENT");

  /// @notice Define certificates statuses
  /// @dev Only Published status allow to mint
  enum Status {Draft, Published, Closed}

  /// @dev Define certificate struct
  struct Certificate{
    uint256 id;
    string  title;
    address issuedBy;
    uint256 issuedDate;
    uint256 validDays;
    Status  status;
  }

  /// @dev Number of certificates created
  uint256 public certificatesCreated;

  /// @dev Array of certificates Ids
  uint256[] public certificateIds;

  /// @dev Mapping of certificates, from certificate id => certificate struct
  mapping(uint256 => Certificate) public certificates;

  /// @dev A mapping from student address => certificate IDs student is holding => NFT token id minted.
  mapping(address => mapping(uint256 => uint256)) public certificatesHolders;

  /// @dev  This is our SVG code for the NFT certificate.
  string public svgHeadCode = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 750 350' width='100%' height='100%'><style>.base { fill: white; font-family: &apos;Courier New&apos;, monospace; font-size: 15px; }</style><defs><linearGradient id='a' x1='0' x2='0' y1='0' y2='1'><stop offset='0' stop-color='#80F'/><stop offset='1' stop-color='#f40'/></linearGradient></defs><pattern id='b' width='24' height='24' patternUnits='userSpaceOnUse'><circle fill='#ffffff' cx='12' cy='12' r='12'/></pattern><rect width='100%' height='100%' fill='url(#a)'/><rect width='100%' height='100%' fill='url(#b)' fill-opacity='0.1'/><text x='5%' y='15%' class='base'>NFT certificate</text>";

  // ---------------------------------------------
  // --------- Events ----------------------------
  // ---------------------------------------------
  event CertificateCreated(uint256 certificateId);
  event NewCertificateNFTMinted(address student, uint256 certificateId);
  //event RegisteredNewTutor(address newTutor);
  event CertificatePublished(uint256 certificateId);
  event CertificateClosed(uint256 certificateId);

  // ---------------------------------------------
  // --------- Modifiers -------------------------
  // ---------------------------------------------
  modifier certificateExists(uint256 _certificateId)
  {
    require(certificates[_certificateId].id != 0, "Certificate not valid" );
    _;
  }

  modifier isPublished(uint256 _certificateId)
  {
    require(certificates[_certificateId].status == Status.Published, "Certificate is not published");
    _;
  }

  modifier notHolded(uint256 _certificateId, address _student)
  {
    require(verifyCertificateHolder(_student, _certificateId) == false, "Can not mint the certificate twice");
    _;
  }

  // ---------------------------------------------
  // --------- Contract start --------------------
  // ---------------------------------------------
 
  /// @notice Constrcutor's contract 
  constructor() ERC721("Certificate NFT", "CERT"){
    // Grant the contract deployer the default admin role: it will be able
    // to grant and revoke any roles
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setupRole(TUTOR, msg.sender);
    _setupRole(STUDENT, msg.sender);
    certificatesCreated = 0;
    // Increment the counter for token, so it starts in 1.
    _tokenIds.increment();
  }

  /// @notice Create a new certificate
  /// @param _title A title for the certificate
  /// @param _issuedBy Address of the certificate's issuer
  /// @param _validDays Amount of days the certificate is valid
  /// @return The generated certificate ID (number)
  /// @dev Only role TUTOR is able to create certificates. 
  /// The certificate ID is a number generated from: the global counter certificatesCreated and the user address.
  function createCertificate(
    string memory _title,
    address _issuedBy,
    uint256 _validDays
    ) public
    onlyRole(TUTOR)
    returns(uint256)
  {
    uint256 certificateId = uint256(keccak256(abi.encodePacked(Strings.toString(certificatesCreated), msg.sender)));
    Certificate memory certificate;
    
    certificate.id         = certificateId;
    certificate.title      = _title;
    certificate.issuedBy   = _issuedBy;
    certificate.issuedDate = block.timestamp;
    certificate.validDays  = _validDays;
    certificate.status     = Status.Draft;
    
    certificates[certificateId] = certificate;
    certificatesCreated++;

    certificateIds.push(certificateId);

    emit CertificateCreated(certificateId);
    
    return certificateId;
  }

  /// @notice Fetches all certificates.
  /// @return An array containing all certificates created.
  function getCertificates() public view returns(Certificate[] memory)
  {
    Certificate[] memory resultCertificates = new Certificate[](certificateIds.length);

    for(uint i=0; i < certificateIds.length; i++){
      resultCertificates[i] = certificates[certificateIds[i]];
    }

    return resultCertificates;
  }

  /// @notice Fetches the certificates owned by a user
  /// @param _holder The address of the holder/student
  /// @dev Returns the certificate data plus the NFT token Ids
  /// @return An array of data certificates owned by the user and the NFT tokens ID for them
  function getCertificatesByHolder(address _holder) public view returns(Certificate[] memory, uint256[] memory)
  {
    uint totalCertificates = balanceOf(_holder);
    Certificate[] memory resultCertificates = new Certificate[](totalCertificates);
    uint256[] memory tokens = new uint256[](totalCertificates);
    uint idx = 0;

    for(uint i=0; i < certificateIds.length; i++){
      if(certificatesHolders[_holder][certificateIds[i]] != 0){ // if != 0 user owns a token
        resultCertificates[idx] = certificates[certificateIds[i]];
        tokens[idx] = certificatesHolders[_holder][certificateIds[i]];
        idx++;
      }
    }
    return (resultCertificates, tokens);
  }

  
  // ---------------------------------------------  
  // -------- Admin functions --------------------
  // ---------------------------------------------

  /// @notice Register a new TUTOR user
  /// @dev Only ADMINs are allowed to register new TUTORS
  function registerTutor(address _newTutor) public
  {
    grantRole(TUTOR, _newTutor);
  }

  /// @notice Publish a certificate, this status allows to mint the certificate
  /// @param _certificateId the certificate ID we want to publish
  function publishCertificate(uint256 _certificateId) public
  {
    _setCertificateStatus(_certificateId, Status.Published);
    emit CertificatePublished(_certificateId);
  }

  /// @notice Close a certificate, this status does not allow to mint the certificate
  /// @param _certificateId the certificate ID we want to close
  function closeCertificate(uint256 _certificateId) public 
  {
    _setCertificateStatus(_certificateId, Status.Closed);
    emit CertificateClosed(_certificateId);
  }

  /// @notice Change a certificate stauts
  /// @param _certificateId the certificate ID we want to close
  /// @param _status the new status
  /// @dev only TUTOR role is allowed to change a certificate's status; also the certificate must exists.
  function _setCertificateStatus(uint256 _certificateId, Status _status) private
    onlyRole(TUTOR)
    certificateExists(_certificateId)
  {
    certificates[_certificateId].status = _status;
  }

  // ---------------------------------------------  
  // -------- Utility SVG functions --------------
  // ---------------------------------------------

  function courseIssuedToSVGText(address _student) private pure returns (string memory)
  {
    return string(
      abi.encodePacked(
        "<text x='5%' y='25%' class='base'>Issued To:", 
        Strings.toHexString(uint256(keccak256(abi.encodePacked(_student)))),
        "</text>"
      )
    );
  }

  function courseIssueBySVGText(Certificate memory _certificate) private pure returns (string memory)
  {
    return string(
      abi.encodePacked(
        "<text x='5%' y='30%' class='base'>Issued By:",
        Strings.toHexString(uint256(keccak256(abi.encodePacked(_certificate.issuedBy)))),
        "</text>"
      )
    );
  }

  function courseNameSVGText(Certificate memory _certificate) private pure returns (string memory)
  {
    return string(abi.encodePacked("<text x='5%' y='35%' class='base'>Course name: ", _certificate.title, "</text>"));
  }

  function courseIssueDateSVGText(Certificate memory _certificate) private pure returns (string memory)
  {
    return string(abi.encodePacked("<text x='5%' y='40%' class='base'>Issued Date: ", Strings.toString(_certificate.issuedDate), "</text>"));
  }

  function courseValidDaysSVGText(Certificate memory _certificate) private pure returns (string memory)
  {
    return string(abi.encodePacked("<text x='5%' y='45%' class='base'>Valid days: ", Strings.toString(_certificate.validDays), "</text>"));
  }
  
  function courseIdSVGText(Certificate memory _certificate) private pure returns (string memory)
  {
    return string(abi.encodePacked("<text x='5%' y='50%' class='base'>ID: ", Strings.toString(_certificate.id), "</text>"));
  }

  /// @notice Create the SVG data for the NFT certificate
  /// @param _certificate the certificate ID
  /// @param _student address of the student
  /// @dev generate a SVG code that would be used in the token URI
  function createSVG(Certificate memory _certificate, address _student) private view returns(string memory){
    string memory courseIssuedToSVG  = courseIssuedToSVGText(_student);
    string memory courseNameSVG      = courseNameSVGText(_certificate);
    string memory courseIssueBySVG   = courseIssueBySVGText(_certificate);
    string memory courseIssueDateSVG = courseIssueDateSVGText(_certificate);
    string memory courseValidDaysSVG = courseValidDaysSVGText(_certificate);
    string memory courseIdSVG        = courseIdSVGText(_certificate);

    // I concatenate it all together, and then close the <text> and <svg> tags.
    string memory finalSVGCode = string(
      abi.encodePacked(
        svgHeadCode,
        courseIssuedToSVG,
        courseNameSVG,
        courseIssueBySVG,
        courseIssueDateSVG,
        courseValidDaysSVG,
        courseIdSVG,
        "</svg>"
      )
    );
    return finalSVGCode;
  }

  // ---------------------------------------------  
  // -------- Mint certificate function ---------
  // ---------------------------------------------

  /// @notice Mint the NFT certificate
  /// @param _certificateId the certificate ID we want to mint
  /// @dev Mint the NFT only if cetificate exists, is published and was not previously minted by the student
  /// @return the minted token ID
  function mintCertificateNFT(uint256 _certificateId) public
      certificateExists(_certificateId)
      isPublished(_certificateId)
      notHolded(_certificateId, msg.sender)
      returns(uint256)
  {
     // Get the current tokenId, this starts at 1.
    uint256 newTokenId = _tokenIds.current();

    Certificate memory certificate = certificates[_certificateId];

    string memory finalSVGCode = createSVG(certificate, msg.sender);
        
    // Get all the JSON metadata + SVG code in place and base64 encode it.
    string memory json = Base64.encode(
        bytes(
            string(
                abi.encodePacked(
                    '{"name": "NFT certificate #',
                    // We set the title of our NFT as the generated word.
                    Strings.toString(_certificateId),
                    '", "description": "NFT course certificate.", "image": "data:image/svg+xml;base64,',
                    // We add data:image/svg+xml;base64 and then append our base64 encode our svg.
                    Base64.encode(bytes(finalSVGCode)),
                    '"}'
                )
            )
        )
    );

    // prepend data:application/json;base64, to our data.
    string memory finalTokenUri = string(
        abi.encodePacked("data:application/json;base64,", json)
    );

     // mint the NFT to the sender using msg.sender.
    _safeMint(msg.sender, newTokenId);

    // Update token uri
    _setTokenURI(newTokenId, finalTokenUri);

    //update new student's certificate
    certificatesHolders[msg.sender][_certificateId] = newTokenId;

    // Increment the counter for when the next NFT is minted.
    _tokenIds.increment();
    
    emit NewCertificateNFTMinted(msg.sender, newTokenId);

    return newTokenId;
  }

  /// @notice Allows anyone to verificate if a student is holding a certificate
  /// @dev Verificate the onwerhsip of the NTF as token plus the existence of the record in the contract.
  /// @param _student The wallet address of the student to be verified.
  /// @param _certificateId The certificate Id we want to verify.
  /// @return The student owns the certificate or not.
  function verifyCertificateHolder(address _student, uint256 _certificateId) public view 
    certificateExists(_certificateId)
    returns(bool)
  {
    bool hasCertificate = false;
    uint256 mintedTokenId = certificatesHolders[_student][_certificateId];
    
    if(mintedTokenId > 0 && _student == ownerOf(mintedTokenId)){
      hasCertificate = true;
    }
    return hasCertificate;
  }

  // ---------------------------------------------
  // -------- required by Solidity ---------------
  function supportsInterface(bytes4 interfaceId)
      public
      view
      override(ERC721, AccessControl)
      returns (bool)
  {
      return super.supportsInterface(interfaceId);
  }
}
