using System;
using System.Linq;
using DocumentFormat.OpenXml.Presentation;
using DocumentFormat.OpenXml.Packaging;
using System.IO;
using System.Collections.Generic;

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
            int nr = 0;


            string basePath = AppDomain.CurrentDomain.BaseDirectory;
            string srcSlide = System.IO.Path.Combine(basePath, @"..\..\..\..\slides\All_slides_EN_small.pptx");
            string outSlide = System.IO.Path.Combine(basePath, @"..\..\..\..\slides\empty.pptx");
            string tempSlide = System.IO.Path.Combine(basePath, @"..\..\..\..\slides\Slide Master paiqo v0.4 - with one slide.pptx");

            Console.WriteLine(basePath + "\n" + srcSlide + "\n" + outSlide);
            Console.WriteLine(Path.GetFullPath(srcSlide));
            Console.WriteLine(Path.GetFullPath(outSlide));


            File.Copy(tempSlide, outSlide, true);

            using (PresentationDocument presentationDocument = PresentationDocument.Open(srcSlide, false)) {
                PresentationPart presentationPart = presentationDocument.PresentationPart;

                Presentation presentation = presentationPart.Presentation;


                if (presentationPart != null) {
                    Console.WriteLine("Nr of slides: " + presentationPart.SlideParts.Count());
                    nr = presentationPart.SlideParts.Count();
                }
            }

            
            
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
            string presentationFile = System.IO.Path.Combine(basePath, @"..\..\..\..\slides\new.pptx");
            string themePresentation = System.IO.Path.Combine(basePath, @"..\..\..\..\slides\All_slides_EN_small.pptx");
            */

            /*
            for (uint i = 1; i < nr + 1; i++) {
                Copy(
                    srcSlide,
                    i,
                    outSlide
                );
            }
            */

            DeleteSlide(outSlide, 0);

            ApplyThemeToPresentation(outSlide, srcSlide);

        }

        // Get the presentation object and pass it to the next DeleteSlide method.
        public static void DeleteSlide(string presentationFile, int slideIndex) {
            // Open the source document as read/write.

            using (PresentationDocument presentationDocument = PresentationDocument.Open(presentationFile, true)) {
                // Pass the source document and the index of the slide to be deleted to the next DeleteSlide method.
                DeleteSlide(presentationDocument, slideIndex);
            }
        }

        // Delete the specified slide from the presentation.
        public static void DeleteSlide(PresentationDocument presentationDocument, int slideIndex) {
            if (presentationDocument == null) {
                throw new ArgumentNullException("presentationDocument");
            }

            // Use the CountSlides sample to get the number of slides in the presentation.
            int slidesCount = CountSlides(presentationDocument);

            if (slideIndex < 0 || slideIndex >= slidesCount) {
                throw new ArgumentOutOfRangeException("slideIndex");
            }

            // Get the presentation part from the presentation document. 
            PresentationPart presentationPart = presentationDocument.PresentationPart;

            // Get the presentation from the presentation part.
            Presentation presentation = presentationPart.Presentation;

            // Get the list of slide IDs in the presentation.
            SlideIdList slideIdList = presentation.SlideIdList;

            // Get the slide ID of the specified slide
            SlideId slideId = slideIdList.ChildElements[slideIndex] as SlideId;

            // Get the relationship ID of the slide.
            string slideRelId = slideId.RelationshipId;

            // Remove the slide from the slide list.
            slideIdList.RemoveChild(slideId);

            // Remove references to the slide from all custom shows.
            if (presentation.CustomShowList != null) {
                // Iterate through the list of custom shows.
                foreach (var customShow in presentation.CustomShowList.Elements<CustomShow>()) {
                    if (customShow.SlideList != null) {
                        // Declare a link list of slide list entries.
                        LinkedList<SlideListEntry> slideListEntries = new LinkedList<SlideListEntry>();
                        foreach (SlideListEntry slideListEntry in customShow.SlideList.Elements()) {
                            // Find the slide reference to remove from the custom show.
                            if (slideListEntry.Id != null && slideListEntry.Id == slideRelId) {
                                slideListEntries.AddLast(slideListEntry);
                            }
                        }

                        // Remove all references to the slide from the custom show.
                        foreach (SlideListEntry slideListEntry in slideListEntries) {
                            customShow.SlideList.RemoveChild(slideListEntry);
                        }
                    }
                }
            }

            // Save the modified presentation.
            presentation.Save();

            // Get the slide part for the specified slide.
            SlidePart slidePart = presentationPart.GetPartById(slideRelId) as SlidePart;

            // Remove the slide part.
            presentationPart.DeletePart(slidePart);
        }

        private static int CountSlides(PresentationDocument presentationDocument) {
            // Check for a null document object.
            if (presentationDocument == null) {
                throw new ArgumentNullException("presentationDocument");
            }

            int slidesCount = 0;

            // Get the presentation part of document.
            PresentationPart presentationPart = presentationDocument.PresentationPart;

            // Get the slide count from the SlideParts.
            if (presentationPart != null) {
                slidesCount = presentationPart.SlideParts.Count();
            }
            // Return the slide count to the previous method.
            return slidesCount;
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

        // Apply a new theme to the presentation. 
        public static void ApplyThemeToPresentation(string presentationFile, string themePresentation) {
            using (PresentationDocument themeDocument = PresentationDocument.Open(themePresentation, false))
            using (PresentationDocument presentationDocument = PresentationDocument.Open(presentationFile, true)) {
                ApplyThemeToPresentation(presentationDocument, themeDocument);
            }
        }

        //Apply a new theme to the presentation. 
        public static void ApplyThemeToPresentation(PresentationDocument presentationDocument, PresentationDocument themeDocument) {
            if (presentationDocument == null) {
                throw new ArgumentNullException("presentationDocument");
            }
            if (themeDocument == null) {
                throw new ArgumentNullException("themeDocument");
            }

            // Get the presentation part of the presentation document.
            PresentationPart presentationPart = presentationDocument.PresentationPart;

            // Get the existing slide master part.
            SlideMasterPart slideMasterPart = presentationPart.SlideMasterParts.ElementAt(0);
            string relationshipId = presentationPart.GetIdOfPart(slideMasterPart);

            // Get the new slide master part.
            SlideMasterPart newSlideMasterPart = themeDocument.PresentationPart.SlideMasterParts.ElementAt(0);

            // Remove the existing theme part.
            presentationPart.DeletePart(presentationPart.ThemePart);

            // Remove the old slide master part.
            presentationPart.DeletePart(slideMasterPart);

            // Import the new slide master part, and reuse the old relationship ID.
            newSlideMasterPart = presentationPart.AddPart(newSlideMasterPart, relationshipId);

            // Change to the new theme part.
            presentationPart.AddPart(newSlideMasterPart.ThemePart);

            Dictionary<string, SlideLayoutPart> newSlideLayouts = new Dictionary<string, SlideLayoutPart>();

            foreach (var slideLayoutPart in newSlideMasterPart.SlideLayoutParts) {
                newSlideLayouts.Add(GetSlideLayoutType(slideLayoutPart), slideLayoutPart);
            }

            string layoutType = null;
            SlideLayoutPart newLayoutPart = null;

            // Insert the code for the layout for this example.
            string defaultLayoutType = "Title and Content";

            // Remove the slide layout relationship on all slides. 
            foreach (var slidePart in presentationPart.SlideParts) {
                layoutType = null;

                if (slidePart.SlideLayoutPart != null) {
                    // Determine the slide layout type for each slide.
                    layoutType = GetSlideLayoutType(slidePart.SlideLayoutPart);

                    // Delete the old layout part.
                    slidePart.DeletePart(slidePart.SlideLayoutPart);
                }

                if (layoutType != null && newSlideLayouts.TryGetValue(layoutType, out newLayoutPart)) {
                    // Apply the new layout part.
                    slidePart.AddPart(newLayoutPart);
                } else {
                    newLayoutPart = newSlideLayouts[defaultLayoutType];

                    // Apply the new default layout part.
                    slidePart.AddPart(newLayoutPart);
                }
            }
        }

        // Get the slide layout type.
        public static string GetSlideLayoutType(SlideLayoutPart slideLayoutPart) {
            CommonSlideData slideData = slideLayoutPart.SlideLayout.CommonSlideData;

            // Remarks: If this is used in production code, check for a null reference.

            return slideData.Name;
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

                Console.WriteLine("InnerText: " + noticePart.NotesSlide.InnerText);

                if (noticePart != null) {
                    addedSlidePart.DeletePart(noticePart);
                }

                SlideMasterPart addedSlideMasterPart = destDoc.PresentationPart.SlideMasterParts.ElementAt(0);
                //SlideMasterPart addedSlideMasterPart = destPresentationPart.AddPart(addedSlidePart.SlideLayoutPart.SlideMasterPart);
                //destPresentationPart.DeletePart(addedSlidePart);

                Console.WriteLine("---");
                Console.WriteLine("ID: " + destDoc.PresentationPart.GetIdOfPart(addedSlidePart));
                Console.WriteLine("ID: " + destDoc.PresentationPart.GetIdOfPart(destDoc.PresentationPart.SlideMasterParts.ElementAt(0)));
                Console.WriteLine("---");

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

                //destDoc.PresentationPart.Presentation.SlideMasterIdList.Append(slideMaterId);
                destDoc.PresentationPart.Presentation.Save();
                // Make sure that all slide layouts have unique ids.
                foreach (SlideMasterPart slideMasterPart1 in destDoc.PresentationPart.SlideMasterParts) {
                    foreach (SlideLayoutId slideLayoutId in slideMasterPart1.SlideMaster.SlideLayoutIdList) {
                        masterId++;
                        slideLayoutId.Id = masterId;
                    }
                    slideMasterPart1.SlideMaster.Save();
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
    }
}
