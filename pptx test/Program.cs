using System;
using System.Linq;
using DocumentFormat.OpenXml.Presentation;
using DocumentFormat.OpenXml.Packaging;
using System.IO;

/**
 * Credit: 
 *          https://stackoverflow.com/questions/49453527/copying-a-slide-from-one-presentation-to-another-using-open-xml-sdk
 *          https://docs.microsoft.com/en-us/answers/questions/539472/getting-a-repair-error-when-copy-slide-from-one-pr.html
 */

namespace pptx_test {
    class Program {

        static uint _uniqueId;

        public static uint uniqueId { get => _uniqueId; set => _uniqueId = value; }

        static void Main(string[] args) {
            string presentationFilePath = @"C:\Users\bib\Projects\Electron\electron-test\input\All_slides_EN_small.pptx";

            int nr = 0;

            using (PresentationDocument presentationDocument = PresentationDocument.Open(presentationFilePath, false)) {
                PresentationPart presentationPart = presentationDocument.PresentationPart;

                if (presentationPart != null) {
                    Console.WriteLine("Nr of slides: " + presentationPart.SlideParts.Count());
                    nr = presentationPart.SlideParts.Count();
                }
            }

            string basePath = AppDomain.CurrentDomain.BaseDirectory;
            string srcSlide = System.IO.Path.Combine(basePath, @"..\..\..\..\slides\All_slides_EN_small.pptx");
            string outSlide = System.IO.Path.Combine(basePath, @"..\..\..\..\slides\empty.pptx");



            Console.WriteLine(basePath + "\n" + srcSlide + "\n" + outSlide);
            Console.WriteLine(Path.GetFullPath(srcSlide));
            Console.WriteLine(Path.GetFullPath(outSlide));

            Copy(
                    srcSlide,
                    5,
                    outSlide
                );

            Copy(
                    srcSlide,
                    1,
                    outSlide
                );

            /*
            for (uint i = 1; i < nr + 1; i++) {
                Copy(
                    srcSlide,
                    i,
                    outSlide
                );
            }
            */
        }

        private static uint CreateId(SlideMasterIdList slideMasterIdList) {
            uint currentId = 0;
            foreach (SlideMasterId masterId in slideMasterIdList) {
                if (masterId.Id > currentId) {
                    currentId = masterId.Id;
                }
            }
            return ++currentId;
        }

        private static uint CreateId(SlideIdList slideIdList) {
            if (slideIdList == null) return 1;

            uint currentId = 0;
            foreach (SlideId slideId in slideIdList) {
                if (slideId.Id > currentId) {
                    currentId = slideId.Id;
                }
            }
            return ++currentId;
        }

        public static void Copy(string sourcePresentationStream, uint copiedSlidePosition, string destPresentationStream) {
            using (var destDoc = PresentationDocument.Open(destPresentationStream, true)) {
                var sourceDoc = PresentationDocument.Open(sourcePresentationStream, false);
                var destPresentationPart = destDoc.PresentationPart;
                var destPresentation = destPresentationPart.Presentation;
                var sourcePresentationPart = sourceDoc.PresentationPart;
                var sourcePresentation = sourcePresentationPart.Presentation;
                int copiedSlideIndex = (int)--copiedSlidePosition;
                int countSlidesInSourcePresentation = sourcePresentation.SlideIdList.Count();
                if (copiedSlideIndex < 0 || copiedSlideIndex >= countSlidesInSourcePresentation)
                    throw new ArgumentOutOfRangeException(nameof(copiedSlidePosition));
                SlideId copiedSlideId = sourcePresentationPart.Presentation.SlideIdList.ChildElements[copiedSlideIndex] as SlideId;
                SlidePart copiedSlidePart = sourcePresentationPart.GetPartById(copiedSlideId.RelationshipId) as SlidePart;
                SlidePart addedSlidePart = destPresentationPart.AddPart<SlidePart>(copiedSlidePart);
                NotesSlidePart noticePart = addedSlidePart.GetPartsOfType<NotesSlidePart>().FirstOrDefault();
                if (noticePart != null) {
                    addedSlidePart.DeletePart(noticePart);
                }
                SlideMasterPart addedSlideMasterPart = destPresentationPart.AddPart(addedSlidePart.SlideLayoutPart.SlideMasterPart);
                // Create new slide ID
                SlideId slideId = new SlideId {
                    Id = CreateId(destPresentation.SlideIdList),
                    RelationshipId = destDoc.PresentationPart.GetIdOfPart(addedSlidePart)
                };
                if(destPresentation.SlideIdList == null) {
                    destPresentation.SlideIdList = new SlideIdList();
                }
                destPresentation.SlideIdList.Append(slideId);
                // Create new master slide ID
                uint masterId = CreateId(destPresentation.SlideMasterIdList);
                SlideMasterId slideMaterId = new SlideMasterId {
                    Id = masterId,
                    RelationshipId = destDoc.PresentationPart.GetIdOfPart(addedSlideMasterPart)
                };
                destDoc.PresentationPart.Presentation.SlideMasterIdList.Append(slideMaterId);
                destDoc.PresentationPart.Presentation.Save();
                // Make sure that all slide layouts have unique ids.
                foreach (SlideMasterPart slideMasterPart in destDoc.PresentationPart.SlideMasterParts) {
                    foreach (SlideLayoutId slideLayoutId in slideMasterPart.SlideMaster.SlideLayoutIdList) {
                        masterId++;
                        slideLayoutId.Id = masterId;
                    }
                    slideMasterPart.SlideMaster.Save();
                }
                destDoc.PresentationPart.Presentation.Save();
                destDoc.Close();
                sourceDoc.Close();
            }
            //sourcePresentationStream.Close();
            // destPresentationStream.Close();
        }

        static uint GetMaxIdFromChild(SlideMasterIdList slideMasterIdList) {
            // Slide master identifiers have a minimum value of greater than
            // or equal to 2147483648. 
            uint max = 2147483648;
            if (slideMasterIdList != null)
                // Get the maximum id value from the current set of children.
                foreach (SlideMasterId child in
                  slideMasterIdList.Elements<SlideMasterId>()) {
                    uint id = child.Id;
                    if (id > max)
                        max = id;
                }
            return max;
        }

        static uint GetMaxIdFromChild(SlideIdList slideMasterIdList) {
            // Slide master identifiers have a minimum value of greater than
            // or equal to 2147483648. 
            uint max = 2147483648;
            if (slideMasterIdList != null)
                // Get the maximum id value from the current set of children.
                foreach (SlideId child in
                  slideMasterIdList.Elements<SlideId>()) {
                    uint id = child.Id;
                    if (id > max)
                        max = id;
                }
            return max;
        }

        static void FixSlideLayoutIds(PresentationPart presPart) {
            // Make sure that all slide layouts have unique ids.
            foreach (SlideMasterPart slideMasterPart in presPart.SlideMasterParts) {
                foreach (SlideLayoutId slideLayoutId in slideMasterPart.SlideMaster.SlideLayoutIdList) {
                    uniqueId++;
                    slideLayoutId.Id = (uint)uniqueId;
                }

                slideMasterPart.SlideMaster.Save();
            }
        }

        /// <summary>
        /// Get the slide layout type.
        /// </summary>
        /// <param name="slideLayoutPart"></param>
        /// <returns></returns>
        private static string GetSlideLayoutType(SlideLayoutPart slideLayoutPart) {
            CommonSlideData slideData = slideLayoutPart.SlideLayout.CommonSlideData;

            return slideData.Name;
        }
    }
}
