param($inputFile, $savePath);

. .\powerPoint.ps1

$array = openPowerpoint $inputFile
$application = $array[0]
$presentation = $array[1]

$presentation.Export($savePath, "PDF")

closePowerpoint $application $presentation