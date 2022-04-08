using System;
using System.Linq;
using DocumentFormat.OpenXml.Presentation;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml;
using System.IO;
using System.Collections.Generic;
using System.Text.Json;
using System.Text;
using D = DocumentFormat.OpenXml.Drawing;
using System.Text.RegularExpressions;
using System.Security.Cryptography;

namespace PptGenerator.TemplateInfo {
    class TemplateReader {

        private List<Template> _templates;

        public List<Template> Templates { get => _templates; set => _templates = value; }

        /// <summary>
        /// A class to read the sections and slides of presentation-templates and export them as json
        /// </summary>
        /// <param name="presentationPaths">A list of paths to presentation-templates</param>
        public TemplateReader(List<string> presentationPaths) {
            Templates = new List<Template>();
            foreach (string presentationPath in presentationPaths) {
                Templates.Add(new Template(presentationPath, ReadSlides(presentationPath)));
            }
        }

        /// <summary>
        /// Export the Sections as json
        /// </summary>
        /// <param name="path">The path to export</param>
        public void ExportAsJson(string path) {
            JsonSerializerOptions options = new JsonSerializerOptions { WriteIndented = true };
            string jsonString = JsonSerializer.Serialize(Templates, options);
            File.WriteAllText(path, jsonString);
        }

        /// <summary>
        /// Get all Section from a presentation
        /// </summary>
        /// <param name="presentationPath">The path to the presentation</param>
        /// <returns>A list of Sections</returns>
        public List<Section> ReadSlides(string presentationPath) {
            using (PresentationDocument presentationDocument = PresentationDocument.Open(presentationPath, true)) {

                List<Section> sections = new List<Section>();

                PresentationPart presentationPart = presentationDocument.PresentationPart;
                Presentation presentation = presentationPart.Presentation;

                bool foundSections = false;

                var extLst = selectElementByTag(presentation, "extLst");
                foreach (var ext in extLst) {
                    var sectionLst = selectElementByTag(ext, "sectionLst");
                    if (sectionLst == null) continue;

                    Console.WriteLine("-------------------------------");
                    Section beforeFirstSection = new Section("");
                    int lastPosition = -1;
                    int firstPosition = int.MaxValue;
                    foreach (var sectionElem in sectionLst) {
                        if (sectionElem is DocumentFormat.OpenXml.Office2010.PowerPoint.Section of2010Section) {
                            foundSections = true;
                            Section section = new Section(of2010Section.Name);
                            sections.Add(section);

                            bool serachForUnlinkedSLides = true;
                            foreach (DocumentFormat.OpenXml.Office2010.PowerPoint.SectionSlideIdListEntry item in of2010Section.SectionSlideIdList) {

                                // Search for all slides in this section and  add all slides before this section to the section befor this one
                                uint position = 0;
                                foreach (SlideId slideId in presentation.SlideIdList) {
                                    // Skip all slides that are already in a section
                                    if (position <= lastPosition) {
                                        position++;
                                        continue;
                                        Console.WriteLine("continue");
                                    }

                                    if (slideId.Id == item.Id) {
                                        Console.WriteLine("found in sec");
                                        // Add slide to current section
                                        serachForUnlinkedSLides = false;
                                        SlidePart slidePart = presentationPart.GetPartById(slideId.RelationshipId) as SlidePart;
                                        Slide slide = getSlideFromPart(position, slideId, slidePart);

                                        section.Slides.Add(slide);
                                        lastPosition = (int)position;
                                        if (lastPosition < firstPosition) firstPosition = lastPosition;
                                    } else if (serachForUnlinkedSLides) {
                                        Console.WriteLine("serachForUnlinkedSLides");
                                        // If this slide is not jet in a section add it to the section before the current one
                                        SlidePart slidePart = presentationPart.GetPartById(slideId.RelationshipId) as SlidePart;
                                        Slide slide = getSlideFromPart(position, slideId, slidePart);
                                        if (sections.Count >= 2) {
                                            sections[sections.Count - 2].Slides.Add(slide);
                                            lastPosition = (int)position;
                                            if (lastPosition < firstPosition) firstPosition = lastPosition;
                                        }
                                    } else {
                                        Console.WriteLine("break");
                                        // Found a slide that is not in the sectionlist
                                        // break to check if its in the next section. If it is, it will be added then
                                        break;
                                    }
                                    position++;
                                }
                            }
                        }
                    }
                    // Find last section with slides
                    int lastSectionIndex = 0;
                    for (int i = sections.Count - 1; i > 0; i--) {
                        if (sections[i].Slides.Count > 0) {
                            lastSectionIndex = i;
                            break;
                        }
                    }

                    // Add the rest of the slides to the last section with slides
                    uint pos = 0;
                    foreach (SlideId slideId in presentation.SlideIdList) {
                        if (pos < firstPosition) {
                            SlidePart slidePart = presentationPart.GetPartById(slideId.RelationshipId) as SlidePart;
                            Slide slide = getSlideFromPart(pos, slideId, slidePart);

                            sections[0].Slides.Insert((int)pos, slide);
                        }
                        if (pos <= lastPosition) {
                            // Skip all slides that are already in a section
                            pos++;
                            continue;
                        } else if (sections.Count > 0) {
                            // Add the slide to the las section with slides
                            SlidePart slidePart = presentationPart.GetPartById(slideId.RelationshipId) as SlidePart;
                            Slide slide = getSlideFromPart(pos, slideId, slidePart);

                            sections[lastSectionIndex].Slides.Add(slide);
                        }
                        pos++;
                    }
                }

                if (!foundSections) {
                    // If no section were found add all slides to a section titled "__defaultSection"
                    Section section = new Section("__defaultSection");
                    sections.Add(section);
                    uint position = 0;
                    foreach (SlideId slideId in presentation.SlideIdList) {
                        SlidePart slidePart = presentationPart.GetPartById(slideId.RelationshipId) as SlidePart;
                        Slide slide = getSlideFromPart(position, slideId, slidePart);

                        section.Slides.Add(slide);
                        position++;
                    }
                }

                presentationDocument.Close();
                return sections;
            }
        }

        /// <summary>
        /// Creates a Slide object from a slidePart and returns it.
        /// </summary>
        /// <param name="position">The position of the Slide in its presenbtation</param>
        /// <param name="slideId">The slide id</param>
        /// <param name="slidePart">The slidePart</param>
        /// <returns>A Slide object created form the slidePart</returns>
        private static Slide getSlideFromPart(uint position, SlideId slideId, SlidePart slidePart) {
            string title = "";
            try {
                title = GetSlideTitle(slidePart);
            } catch (Exception) { }

            // Replace PowerPoint jank
            string contentString = slidePart.Slide.CommonSlideData.ShapeTree.InnerXml;
            contentString = Regex.Replace(contentString, "xmlns:[^=]*=\"http://schemas.microsoft.com/[^\"]*\"", "");
            contentString = Regex.Replace(contentString, "<a:t>[0-9]+</a:t>", "");

            string hash = GetHashString(contentString);

            NotesSlidePart notesSlidePart = slidePart.GetPartsOfType<NotesSlidePart>().FirstOrDefault();
            string uid = "";
            if (notesSlidePart != null) {
                foreach (Shape shape in notesSlidePart.NotesSlide.Descendants<Shape>()) {
                    if (shape.TextBody != null && shape.TextBody.InnerText.ToLower().Contains("uid:")) {
                        foreach (var paragraph in shape.TextBody.Descendants<D.Paragraph>()) {
                            if (paragraph.InnerText.ToLower().Contains("uid:")) {
                                string[] uidArr = paragraph.InnerText.Split("UID:");
                                uidArr = uidArr[1].Split(" ");
                                uid = uidArr[0];
                            }
                        }
                    }
                }
                if (uid == "") {
                    string[] uidArr = notesSlidePart.NotesSlide.InnerText.Split("UID:");
                    uid = (uidArr.Length > 1) ? uidArr[1].Substring(0, 22) : "";
                }
            }

            // Match Placeholder
            string text = slidePart.Slide.InnerText;
            Regex regex = new Regex(@"~\$[^~]*\$~", RegexOptions.Compiled);
            MatchCollection matches = regex.Matches(text);

            List<String> placeholders = new List<string>();

            foreach (Match match in matches) {
                Console.WriteLine($"placehonder: {match.Value}");
                placeholders.Add(match.Value.Substring(2, match.Value.Length - 4));
            }

            bool isHidden = false;
            if (slidePart.Slide.Show != null && !slidePart.Slide.Show.Value) {
                isHidden = true;
            }

            Slide slide = new Slide(slideId.RelationshipId, uid, position, title, hash, isHidden, placeholders);
            return slide;
        }

        /// <summary>
        /// Hashes the inputString and returns a byte array
        /// source: https://stackoverflow.com/questions/3984138/hash-string-in-c-sharp
        /// </summary>
        /// <param name="inputString">The string that will be hashed</param>
        /// <returns>the hashed inputString as a byte array</returns>
        public static byte[] GetHash(string inputString) {
            using (HashAlgorithm algorithm = SHA256.Create())
                return algorithm.ComputeHash(Encoding.UTF8.GetBytes(inputString));
        }

        /// <summary>
        /// Hashes the inputString and returns a string
        /// source: https://stackoverflow.com/questions/3984138/hash-string-in-c-sharp
        /// </summary>
        /// <param name="inputString">The string that will be hashed</param>
        /// <returns>the hashed inputString as a string</returns>
        public static string GetHashString(string inputString) {
            StringBuilder sb = new StringBuilder();
            foreach (byte b in GetHash(inputString))
                sb.Append(b.ToString("X2"));

            return sb.ToString();
        }

        /// <summary>
        /// Find an xmlElement by tag-name.
        /// If more then one are found returns the first on
        /// </summary>
        /// <param name="element">The parent element of the searched element</param>
        /// <param name="tag">The tag-name</param>
        /// <returns>The first childElement with given tag-name or null</returns>
        private OpenXmlElement selectElementByTag(OpenXmlElement element, string tag) {
            return element.Where((el) => {
                return el.LocalName == tag;
            }).FirstOrDefault();
        }

        /// <summary>
        /// Find xmlElements by tag-name.
        /// </summary>
        /// <param name="element">The parent element of the searched element</param>
        /// <param name="tag">The tag-name</param>
        /// <returns>The childElements with given tag-name or null</returns>
        private IEnumerable<OpenXmlElement> selectElementsByTag(OpenXmlElement element, string tag) {
            return element.Where((el) => {
                return el.LocalName == tag;
            });
        }

        /// <summary>
        /// Get the title string of the slide.
        /// This is a method form the microsoft docs
        /// </summary>
        /// <param name="slidePart"></param>
        /// <returns></returns>
        public static string GetSlideTitle(SlidePart slidePart) {
            if (slidePart == null) {
                throw new ArgumentNullException("presentationDocument");
            }

            // Declare a paragraph separator.
            string paragraphSeparator = null;

            if (slidePart.Slide != null) {
                // Find all the title shapes.
                var shapes = from shape in slidePart.Slide.Descendants<Shape>()
                             where IsTitleShape(shape)
                             select shape;

                StringBuilder paragraphText = new StringBuilder();

                foreach (var shape in shapes) {
                    // Get the text in each paragraph in this shape.
                    foreach (var paragraph in shape.TextBody.Descendants<D.Paragraph>()) {
                        // Add a line break.
                        paragraphText.Append(paragraphSeparator);

                        foreach (var text in paragraph.Descendants<D.Text>()) {
                            paragraphText.Append(text.Text);
                        }

                        paragraphSeparator = "\n";
                    }
                }

                return paragraphText.ToString();
            }

            return string.Empty;
        }

        /// <summary>
        /// Determines whether the shape is a title shape.
        /// This is a method form the microsoft docs
        /// </summary>
        /// <param name="shape">The shape</param>
        /// <returns></returns>
        private static bool IsTitleShape(Shape shape) {
            var placeholderShape = shape.NonVisualShapeProperties.ApplicationNonVisualDrawingProperties.GetFirstChild<PlaceholderShape>();
            if (placeholderShape != null && placeholderShape.Type != null && placeholderShape.Type.HasValue) {
                switch ((PlaceholderValues)placeholderShape.Type) {
                    // Any title shape.
                    case PlaceholderValues.Title:

                    // A centered title.
                    case PlaceholderValues.CenteredTitle:
                        return true;

                    default:
                        return false;
                }
            }
            return false;
        }
    }
}
