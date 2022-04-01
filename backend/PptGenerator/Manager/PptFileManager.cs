using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Presentation;
using System;
using System.Collections.Generic;
using System.Linq;
using D = DocumentFormat.OpenXml.Drawing;

/**
* Credit: 
*          https://stackoverflow.com/questions/49453527/copying-a-slide-from-one-presentation-to-another-using-open-xml-sdk
*          https://docs.microsoft.com/en-us/answers/questions/539472/getting-a-repair-error-when-copy-slide-from-one-pr.html
*          https://docs.microsoft.com/en-us/office/open-xml/open-xml-sdk
*/

namespace PptGenerator.Manager {
    class PptFileManager {
        /// <summary>
        /// Copy a set of slides from one presentation to another and replace it's placeholders
        /// </summary>
        /// <param name="sourcePresentationStream">The source presentation path that will be used as a stream</param>
        /// <param name="copiedSlidePositions">A list of slide indexes that will be copied</param>
        /// <param name="destPresentationStream">The destination presentation path that will be used as a stream</param>
        /// <param name="placeholders">A list of placeholders tha will be replaced</param>
        public static void Copy(
            string sourcePresentationStream, 
            List<uint> copiedSlidePositions, 
            List<uint> replaceSlidePositions, 
            string destPresentationStream, 
            List<KeyValuePair<string, string>> placeholders
        ) {
            using (PresentationDocument destDoc = PresentationDocument.Open(destPresentationStream, true)) {
                PresentationDocument sourceDoc = PresentationDocument.Open(sourcePresentationStream, false);

                PresentationPart destPresentationPart = destDoc.PresentationPart;
                Presentation destPresentation = destPresentationPart.Presentation;

                PresentationPart sourcePresentationPart = sourceDoc.PresentationPart;
                Presentation sourcePresentation = sourcePresentationPart.Presentation;

                for (int i = 0; i < copiedSlidePositions.Count; i++) {
                    uint copiedSlidePosition = copiedSlidePositions[i];
                    if (i < replaceSlidePositions.Count) {
                        int insertIndex = (int)replaceSlidePositions[i] + 1;
                        copyOneSlide(copiedSlidePosition, destPresentationPart, destPresentation, sourcePresentationPart, sourcePresentation, placeholders, insertIndex);
                        DeleteOneSlide(destDoc, (int)replaceSlidePositions[i]);
                    } else {
                        copyOneSlide(copiedSlidePosition, destPresentationPart, destPresentation, sourcePresentationPart, sourcePresentation, placeholders);
                    }

                    }

                destDoc.PresentationPart.Presentation.Save();
                destDoc.Close();
                sourceDoc.Close();
            }
        }



        /// <summary>
        /// Get the number of slides in a presentation
        /// This is a method form the microsoft docs
        /// </summary>
        /// <param name="presentationDocument">The presentation</param>
        /// <returns>The number of slides in a presentation</returns>
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



        /// <summary>
        /// Copy one slide from one presentation to another and replace the placeholders
        /// </summary>
        /// <param name="copiedSlideIndex">The index of the slide that will be copied from the source presentation</param>
        /// <param name="destPresentationPart">The destination presentation part</param>
        /// <param name="destPresentation">The destination presentation</param>
        /// <param name="sourcePresentationPart">The source presentation part</param>
        /// <param name="sourcePresentation">The source presentation</param>
        /// <param name="placeholders">An array of placeholders that should be replaced</param>
        private static void copyOneSlide(
            uint copiedSlideIndex, 
            PresentationPart destPresentationPart, 
            Presentation destPresentation, 
            PresentationPart sourcePresentationPart, 
            Presentation sourcePresentation, 
            List<KeyValuePair<string, string>> placeholders,
            int position = -1
        ) {
            // Check if index is out of range
            int countSlidesInSourcePresentation = sourcePresentation.SlideIdList.Count();
            if (copiedSlideIndex < 0 || copiedSlideIndex >= countSlidesInSourcePresentation)
                throw new ArgumentOutOfRangeException(nameof(copiedSlideIndex));

            // Get the slide
            SlideId copiedSlideId = sourcePresentation.SlideIdList.ChildElements[(int)copiedSlideIndex] as SlideId;
            SlidePart copiedSlidePart = sourcePresentationPart.GetPartById(copiedSlideId.RelationshipId) as SlidePart;
            SlidePart addedSlidePart = destPresentationPart.AddPart<SlidePart>(copiedSlidePart);


            // Removed notes 
            NotesSlidePart noticePart = addedSlidePart.GetPartsOfType<NotesSlidePart>().FirstOrDefault();
            NotesSlide notes = null;
            if (noticePart != null) {
                notes = noticePart.NotesSlide;
                addedSlidePart.DeletePart(noticePart);
            }

            // Create new slide ID
            SlideId slideId = new SlideId {
                Id = CreateId(destPresentation.SlideIdList),
                RelationshipId = destPresentationPart.GetIdOfPart(addedSlidePart)
            };

            // Replace the placeholders if on exists
            if (addedSlidePart.Slide != null && addedSlidePart.Slide.InnerText.Contains("~$")) {
                foreach (var item in addedSlidePart.Slide.Descendants<Shape>()) {
                    foreach (var paragraph in item.TextBody.Descendants<D.Paragraph>()) {

                        List<D.Text> paragraphs = paragraph.Descendants<D.Text>().ToList();

                        for (int i = 0; i < paragraphs.Count; i++) {
                            D.Text text = paragraphs[i];
                            replacePlaceholder(text, placeholders);
                        }

                        foreach (var text in paragraph.Descendants<D.Text>()) {
                            foreach (KeyValuePair<string, string> placeholder in placeholders) {
                                text.Text = text.Text.Replace($"~${placeholder.Key}$~", placeholder.Value);
                            }
                        }
                    }
                }
            }

            // Adding a SlideIdList
            if (destPresentation.SlideIdList == null) {
                destPresentation.SlideIdList = new SlideIdList();
            }

            // Set position
            if (position < 0) {
                destPresentation.SlideIdList.Append(slideId);
            } else {
                destPresentation.SlideIdList.InsertAt<SlideId>(slideId, position);
            }

            // Added back notes
            if (notes != null) {
                SlidePart slidePart2 = (SlidePart)destPresentationPart.GetPartById(slideId.RelationshipId);
                NotesSlidePart notesSlidePart1 = slidePart2.AddNewPart<NotesSlidePart>(slideId.RelationshipId);
                notesSlidePart1.NotesSlide = notes;
            }
        }

        private static bool isInPlaceholder = false;

        /// <summary>
        /// Replaces a placholder in a D.Text object
        /// </summary>
        /// <param name="text">The object where the text that should be replaced</param>
        /// <param name="placeholders">A list of placeholders</param>
        private static void replacePlaceholder(D.Text text, List<KeyValuePair<string, string>> placeholders) {
            int startCount = text.Text.Split("~$").Length - 1;
            int endCount = text.Text.Split("$~").Length - 1;
            if (startCount == 0 && endCount == 0) {
                if (isInPlaceholder) {
                    foreach (KeyValuePair<string, string> placeholder in placeholders) {
                        text.Text = text.Text.Replace($"{placeholder.Key}", placeholder.Value);
                    }
                }
                return;
            }

            if (startCount > endCount) {
                isInPlaceholder = true;
                if (startCount == 1) {
                    foreach (KeyValuePair<string, string> placeholder in placeholders) {
                        text.Text = text.Text.Replace($"~${placeholder.Key}", placeholder.Value);
                    }
                    text.Text = text.Text.Replace("~$", "");
                } else {
                    // TODO: 
                    foreach (KeyValuePair<string, string> placeholder in placeholders) {
                        text.Text = text.Text.Replace($"~${placeholder.Key}$~", placeholder.Value);
                    }
                    replacePlaceholder(text, placeholders);
                }
            } else if (endCount > startCount) {
                isInPlaceholder = false;
                if (endCount == 1) {
                    foreach (KeyValuePair<string, string> placeholder in placeholders) {
                        text.Text = text.Text.Replace($"{placeholder.Key}$~", placeholder.Value);
                    }
                    text.Text = text.Text.Replace("$~", "");
                } else {
                    // TODO: 
                    foreach (KeyValuePair<string, string> placeholder in placeholders) {
                        text.Text = text.Text.Replace($"~${placeholder.Key}$~", placeholder.Value);
                    }
                    replacePlaceholder(text, placeholders);
                }
            } else {
                foreach (KeyValuePair<string, string> placeholder in placeholders) {
                    text.Text = text.Text.Replace($"~${placeholder.Key}$~", placeholder.Value);
                }
            }
        }

        /// <summary>
        /// Delete a slide of a presentation at a specific index
        /// This is a method form the microsoft docs
        /// </summary>
        /// <param name="presentationFile">The path to the presentation</param>
        /// <param name="slideIndex">he index of the slide that will be deleted</param>
        public static void DeleteOneSlide(string presentationFile, int slideIndex) {
            // Open the source document as read/write.
            using (PresentationDocument presentationDocument = PresentationDocument.Open(presentationFile, true)) {
                // Pass the source document and the index of the slide to be deleted to the next DeleteSlide method.
                DeleteOneSlide(presentationDocument, slideIndex);
            }
        }

        /// <summary>
        /// Delete a slide of a presentation at a specific index
        /// This is a method form the microsoft docs
        /// </summary>
        /// <param name="presentationDocument">The presentation</param>
        /// <param name="slideIndex">The index of the slide that will be deleted</param>
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

        /// <summary>
        /// Create a new unique id
        /// </summary>
        /// <param name="slideIdList">The current slide list</param>
        /// <returns>A new unique id</returns>
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

        /// <summary>
        /// Applies a theme from one presentation to another
        /// This is a method form the microsoft docs
        /// </summary>
        /// <param name="presentationFile">The path to the presentation that gets a new theme</param>
        /// <param name="themeDocument">The presentation that has the theme</param>
        public static void ApplyThemeToPresentation(string presentationFile, string themePresentation) {
            using (PresentationDocument themeDocument = PresentationDocument.Open(themePresentation, false))
            using (PresentationDocument presentationDocument = PresentationDocument.Open(presentationFile, true)) {
                ApplyThemeToPresentation(presentationDocument, themeDocument);
            }
        }

        /// <summary>
        /// Applies a theme from one presentation to another
        /// This is a method form the microsoft docs
        /// </summary>
        /// <param name="presentationDocument">The presentation that gets a new theme</param>
        /// <param name="themeDocument">The presentation that has the theme</param>
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

        /// <summary>
        /// Get the slide layout name
        /// This is a method form the microsoft docs
        /// </summary>
        /// <param name="slideLayoutPart">The slide layout</param>
        /// <returns>The slide layout name or null</returns>
        public static string GetSlideLayoutType(SlideLayoutPart slideLayoutPart) {
            CommonSlideData slideData = slideLayoutPart.SlideLayout.CommonSlideData;
            if (slideData == null) return null;
            return slideData.Name;
        }
    }
}
