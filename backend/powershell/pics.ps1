param($inputFile, $maxSlides, $savePath);

. .\powerPoint.ps1

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
for ($i = 1; $i -lt $maxSlides + 1; $i++) {
    $outputPath = "$savePath\$i.jpg"
    exportSlide $i $outputPath
    $outputPath = ""
}

closePowerpoint $application $presentation