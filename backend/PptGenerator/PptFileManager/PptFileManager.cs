using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Presentation;
using System;
using System.Collections.Generic;
using System.Linq;
    
namespace pptx_test.PptFileManager {
    /**
    * Credit: 
    *          https://stackoverflow.com/questions/49453527/copying-a-slide-from-one-presentation-to-another-using-open-xml-sdk
    *          https://docs.microsoft.com/en-us/answers/questions/539472/getting-a-repair-error-when-copy-slide-from-one-pr.html
    *          https://docs.microsoft.com/en-us/office/open-xml/open-xml-sdk
    */
    class PptFileManager {

        public static void Copy(string sourcePresentationStream, List<uint> copiedSlidePositions, string destPresentationStream) {
            using (PresentationDocument destDoc = PresentationDocument.Open(destPresentationStream, true)) {
                PresentationDocument sourceDoc = PresentationDocument.Open(sourcePresentationStream, false);

                PresentationPart destPresentationPart = destDoc.PresentationPart;
                Presentation destPresentation = destPresentationPart.Presentation;

                PresentationPart sourcePresentationPart = sourceDoc.PresentationPart;
                Presentation sourcePresentation = sourcePresentationPart.Presentation;

                foreach (uint copiedSlidePosition in copiedSlidePositions) {
                    copyOneSlide(copiedSlidePosition, destPresentationPart, destPresentation, sourcePresentationPart, sourcePresentation);
                }

                destDoc.PresentationPart.Presentation.Save();
                destDoc.Close();
                sourceDoc.Close();
            }
        }

        public static void ApplyThemeToPresentation(string presentationFile, string themePresentation) {
            using (PresentationDocument themeDocument = PresentationDocument.Open(themePresentation, false))
            using (PresentationDocument presentationDocument = PresentationDocument.Open(presentationFile, true)) {
                ApplyThemeToPresentation(presentationDocument, themeDocument);
            }
        }

        public static string GetSlideLayoutType(SlideLayoutPart slideLayoutPart) {
            CommonSlideData slideData = slideLayoutPart.SlideLayout.CommonSlideData;

            // Remarks: If this is used in production code, check for a null reference.

            return slideData.Name;
        }

        public static int CountSlides(PresentationDocument presentationDocument) {
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

        public static void DeleteOneSlide(string presentationFile, int slideIndex) {
            // Open the source document as read/write.

            using (PresentationDocument presentationDocument = PresentationDocument.Open(presentationFile, true)) {
                // Pass the source document and the index of the slide to be deleted to the next DeleteSlide method.
                DeleteOneSlide(presentationDocument, slideIndex);
            }
        }

        
        private static void copyOneSlide(uint copiedSlideIndex, PresentationPart destPresentationPart, Presentation destPresentation, PresentationPart sourcePresentationPart, Presentation sourcePresentation) {
            int countSlidesInSourcePresentation = sourcePresentation.SlideIdList.Count();

            if (copiedSlideIndex < 0 || copiedSlideIndex >= countSlidesInSourcePresentation)
                throw new ArgumentOutOfRangeException(nameof(copiedSlideIndex));

            SlideId copiedSlideId = sourcePresentation.SlideIdList.ChildElements[(int)copiedSlideIndex] as SlideId;
            SlidePart copiedSlidePart = sourcePresentationPart.GetPartById(copiedSlideId.RelationshipId) as SlidePart;
            SlidePart addedSlidePart = destPresentationPart.AddPart<SlidePart>(copiedSlidePart);


            // removed notes 
            // TODO: why?
            NotesSlidePart noticePart = addedSlidePart.GetPartsOfType<NotesSlidePart>().FirstOrDefault();
            NotesSlide notes = noticePart.NotesSlide;
            if (noticePart != null) {
                addedSlidePart.DeletePart(noticePart);
            }

            // Create new slide ID
            SlideId slideId = new SlideId {
                Id = CreateId(destPresentation.SlideIdList),
                RelationshipId = destPresentationPart.GetIdOfPart(addedSlidePart)
            };

            Console.WriteLine(addedSlidePart.Slide.InnerText);
            Console.WriteLine("----------------");

            // TODO: Adding a SlideIdList dosen't work yet
            if (destPresentation.SlideIdList == null) {
                destPresentation.SlideIdList = new SlideIdList();
            }
            destPresentation.SlideIdList.Append(slideId);

            // Added back notes
            SlidePart slidePart2 = (SlidePart)destPresentationPart.GetPartById(slideId.RelationshipId);
            NotesSlidePart notesSlidePart1 = slidePart2.AddNewPart<NotesSlidePart>(slideId.RelationshipId);
            notesSlidePart1.NotesSlide = notes;
        }

        private static void DeleteOneSlide(PresentationDocument presentationDocument, int slideIndex) {
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
                foreach (CustomShow customShow in presentation.CustomShowList.Elements<CustomShow>()) {
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

        private static void ApplyThemeToPresentation(PresentationDocument presentationDocument, PresentationDocument themeDocument) {
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

            foreach (SlideLayoutPart slideLayoutPart in newSlideMasterPart.SlideLayoutParts) {
                newSlideLayouts.Add(GetSlideLayoutType(slideLayoutPart), slideLayoutPart);
            }

            string layoutType = null;
            SlideLayoutPart newLayoutPart = null;

            // Insert the code for the layout for this example.
            string defaultLayoutType = "Title and Content";

            // Remove the slide layout relationship on all slides. 
            foreach (SlidePart slidePart in presentationPart.SlideParts) {
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
    }
}
