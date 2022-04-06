param($inputFile, $slides, $savePath);

. $PSScriptRoot\powerPoint.ps1

$array = openPowerpoint $inputFile
$application = $array[0]
$presentation = $array[1]

# Function to export one slide
function exportSlide($slideNumber, $outputFile) {
    $slide = $presentation.Slides.Item($slideNumber)
    $slide.Export($outputFile, "JPG")
    $slide = $null
}

# Loop all slides
foreach ($slideNumber in $slides) {
    $outputPath = "$savePath\$slideNumber.jpg"
    exportSlide $slideNumber $outputPath
    $outputPath = ""
}

closePowerpoint $application $presentation