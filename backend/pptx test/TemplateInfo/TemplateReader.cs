using System;
using System.Linq;
using DocumentFormat.OpenXml.Presentation;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml;
using System.IO;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading;

namespace pptx_test.TemplateInfo {
    class TemplateReader {

        private List<Section> _sections;

        internal List<Section> Sections { get => _sections; set => _sections = value; }

        public TemplateReader() {
            //_sections = ReadSlides("");
        }

        public List<Section> ReadSlides(string presentationPath) {
            using (PresentationDocument presentationDocument = PresentationDocument.Open(presentationPath, true)) {

                List<Section> sections = new List<Section>();

                PresentationPart presentationPart = presentationDocument.PresentationPart;
                Presentation presentation = presentationPart.Presentation;

                var extLst = selectElementByTag(presentation, "extLst");
                foreach (var ext in extLst) {
                    var sectionLst = selectElementByTag(ext, "sectionLst");
                    if (sectionLst == null) continue;
                    foreach (var sectionElem in sectionLst) {
                        if(sectionElem is DocumentFormat.OpenXml.Office2010.PowerPoint.Section of2010Section) {
                            Section section = new Section(of2010Section.Name);
                            sections.Add(section);

                            foreach (DocumentFormat.OpenXml.Office2010.PowerPoint.SectionSlideIdListEntry item in of2010Section.SectionSlideIdList) {

                                uint position = 0;
                                foreach (SlideId slideId in presentation.SlideIdList) {
                                    if (slideId.Id == item.Id) {
                                        SlidePart slidePart = presentationPart.GetPartById(slideId.RelationshipId) as SlidePart;
                                        NotesSlidePart notesSlidePart = slidePart.GetPartsOfType<NotesSlidePart>().FirstOrDefault();

                                        string[] uidArr = notesSlidePart.NotesSlide.InnerText.Split("UID:");
                                        string uid = (uidArr.Length > 1) ? uidArr[1] : null;

                                        section.Slides.Add(new Slide(slideId.RelationshipId, uid, position));
                                    }
                                    position++;
                                }
                            }

                            Console.WriteLine(section);
                        }
                    }
                }

                presentationDocument.Close();
                return sections;
            }
        }

        private OpenXmlElement selectElementByTag(OpenXmlElement element, string tag) {
            return element.Where((el) => {
                return el.LocalName == tag;
            }).FirstOrDefault();
        }

        private IEnumerable<OpenXmlElement> selectElementsByTag(OpenXmlElement element, string tag) {
            return element.Where((el) => {
                return el.LocalName == tag;
            });
        }
    }
}
