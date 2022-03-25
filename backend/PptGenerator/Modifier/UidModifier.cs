using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Presentation;
using PptGenerator.CommandLine;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using D = DocumentFormat.OpenXml.Drawing;

namespace PptGenerator.Modifier {
    class UidModifier {

        public static void modifyUids(CommandLineArgument clArg) {

            for (int i = 0; i < 100; i++) {
                Console.WriteLine(GenerateUID(clArg.ExistingUids));
            }


            Console.WriteLine(clArg);
            Console.WriteLine(clArg.InPaths);
            Console.WriteLine(clArg.InPaths.FirstOrDefault());
            string presentationPath = clArg.InPaths.FirstOrDefault();
            List<uint> slidePositions = clArg.SlidePos;

            using (PresentationDocument presentationDocument = PresentationDocument.Open(presentationPath, true)) {

                PresentationPart presentationPart = presentationDocument.PresentationPart;
                Presentation presentation = presentationPart.Presentation;

                int slideCount = presentation.SlideIdList.Count();

                foreach (uint slidePosition in slidePositions) {
                    if (slidePosition < 0 || slidePosition >= slideCount) {
                        throw new ArgumentOutOfRangeException(nameof(slidePosition));
                    }

                    // Get the correct slide
                    SlideId slideId = presentation.SlideIdList.ChildElements[(int)slidePosition] as SlideId;
                    SlidePart slidePart = presentationPart.GetPartById(slideId.RelationshipId) as SlidePart;

                    NotesSlidePart notesSlidePart = slidePart.GetPartsOfType<NotesSlidePart>().FirstOrDefault();
                    if (notesSlidePart == null) {

                        notesSlidePart = slidePart.AddNewPart<NotesSlidePart>(slideId.RelationshipId);
                        Console.WriteLine("Created");
                    }
                    if (notesSlidePart.NotesSlide == null) {
                        Console.WriteLine("NotesSlide is null");

                        notesSlidePart.NotesSlide = new NotesSlide(
                        new CommonSlideData(new ShapeTree(
                          new NonVisualGroupShapeProperties(
                            new NonVisualDrawingProperties() { Id = (UInt32Value)1U, Name = "" },
                            new NonVisualGroupShapeDrawingProperties(),
                            new ApplicationNonVisualDrawingProperties()),
                            new GroupShapeProperties(new D.TransformGroup()),
                            new Shape(
                                new NonVisualShapeProperties(
                                    new NonVisualDrawingProperties() { Id = (UInt32Value)2U, Name = "Slide Image Placeholder 1" },
                                    new NonVisualShapeDrawingProperties(new D.ShapeLocks() { NoGrouping = true, NoRotation = true, NoChangeAspect = true }),
                                    new ApplicationNonVisualDrawingProperties(new PlaceholderShape() { Type = PlaceholderValues.SlideImage })),
                                new ShapeProperties()),
                            new Shape(
                                new NonVisualShapeProperties(
                                    new NonVisualDrawingProperties() { Id = (UInt32Value)3U, Name = "Notes Placeholder 2" },
                                    new NonVisualShapeDrawingProperties(new D.ShapeLocks() { NoGrouping = true }),
                                    new ApplicationNonVisualDrawingProperties(new PlaceholderShape() { Type = PlaceholderValues.Body, Index = (UInt32Value)1U })),
                                new ShapeProperties(),
                                new TextBody(
                                    new D.BodyProperties(),
                                    new D.ListStyle(),
                                    new D.Paragraph(
                                        new D.Run(
                                            new D.RunProperties() { Language = "en-US", Dirty = false },
                                            new D.Text() { Text = GenerateUID(clArg.ExistingUids) }),
                                        new D.EndParagraphRunProperties() { Language = "en-US", Dirty = false }))
                                    ))),
                        new ColorMapOverride(new D.MasterColorMapping())
                        );
                    } else {
                        Shape bestShape = null;
                        foreach (Shape shape in notesSlidePart.NotesSlide.Descendants<Shape>()) {
                            if (shape.TextBody != null && (bestShape == null || bestShape.TextBody == null)) bestShape = shape;
                        }

                        if (bestShape != null) {
                            if (bestShape.TextBody == null) {
                                bestShape.TextBody = new TextBody(new D.Paragraph(
                                    new D.Run(
                                        new D.RunProperties() { Language = "en-US", Dirty = false },
                                        new D.Text() { Text = GenerateUID(clArg.ExistingUids) }
                                    ),
                                    new D.EndParagraphRunProperties() { Language = "en-US", Dirty = false }
                                ));
                            } else {
                                bestShape.TextBody.Append(new D.Paragraph(
                                    new D.Run(
                                        new D.RunProperties() { Language = "en-US", Dirty = false },
                                        new D.Text() { Text = GenerateUID(clArg.ExistingUids) }
                                    ),
                                    new D.EndParagraphRunProperties() { Language = "en-US", Dirty = false }
                                ));
                            }
                        }
                    }
                }

                presentation.Save();
                presentationDocument.Close();
            }
        }

        private static D.Paragraph createParagraph(string uid) {
            D.BodyProperties bodyProperties = new D.BodyProperties() { RightToLeftColumns = false, Anchor = D.TextAnchoringTypeValues.Center };
            D.ListStyle listStyle = new D.ListStyle();

            D.Paragraph paragraph = new D.Paragraph();

            D.Text text = new D.Text();
            text.Text = uid;
            paragraph.Append(text);



            D.ParagraphProperties paragraphProperties = new D.ParagraphProperties();
            D.EndParagraphRunProperties endParagraphRunProperties = new D.EndParagraphRunProperties();

            paragraph.Append(paragraphProperties);
            paragraph.Append(endParagraphRunProperties);

            return paragraph;

            // textBody.Append(bodyProperties);
            // textBody.Append(listStyle);
        }


        private void addNote(int index, string docName) {
            string relId = "rId" + (index + 1);
            using (PresentationDocument ppt = PresentationDocument.Open(docName, false)) {
                PresentationPart part = ppt.PresentationPart;
                OpenXmlElementList slideIds = part.Presentation.SlideIdList.ChildElements;

                relId = (slideIds[index] as SlideId).RelationshipId;
            }
            using (PresentationDocument ppt = PresentationDocument.Open(docName, true)) {

                PresentationPart presentationPart1 = ppt.PresentationPart;
                SlidePart slidePart2 = (SlidePart)presentationPart1.GetPartById(relId);
                NotesSlidePart notesSlidePart1;
                string existingSlideNote = "";

                if (slidePart2.NotesSlidePart != null) {
                    //Appened new note to existing note.
                    existingSlideNote = slidePart2.NotesSlidePart.NotesSlide.InnerText + "\n";
                    var val = (NotesSlidePart)slidePart2.GetPartById(relId);
                    notesSlidePart1 = slidePart2.AddPart<NotesSlidePart>(val, relId);
                } else {
                    //Add a new noteto a slide.                      
                    notesSlidePart1 = slidePart2.AddNewPart<NotesSlidePart>(relId);
                }

                NotesSlide notesSlide = new NotesSlide(
                    new CommonSlideData(new ShapeTree(
                      new NonVisualGroupShapeProperties(
                        new NonVisualDrawingProperties() { Id = (UInt32Value)1U, Name = "" },
                        new NonVisualGroupShapeDrawingProperties(),
                        new ApplicationNonVisualDrawingProperties()),
                        new GroupShapeProperties(new D.TransformGroup()),
                        new Shape(
                            new NonVisualShapeProperties(
                                new NonVisualDrawingProperties() { Id = (UInt32Value)2U, Name = "Slide Image Placeholder 1" },
                                new NonVisualShapeDrawingProperties(new D.ShapeLocks() { NoGrouping = true, NoRotation = true, NoChangeAspect = true }),
                                new ApplicationNonVisualDrawingProperties(new PlaceholderShape() { Type = PlaceholderValues.SlideImage })),
                            new ShapeProperties()),
                        new Shape(
                            new NonVisualShapeProperties(
                                new NonVisualDrawingProperties() { Id = (UInt32Value)3U, Name = "Notes Placeholder 2" },
                                new NonVisualShapeDrawingProperties(new D.ShapeLocks() { NoGrouping = true }),
                                new ApplicationNonVisualDrawingProperties(new PlaceholderShape() { Type = PlaceholderValues.Body, Index = (UInt32Value)1U })),
                            new ShapeProperties(),
                            new TextBody(
                                new D.BodyProperties(),
                                new D.ListStyle(),
                                new D.Paragraph(
                                    new D.Run(
                                        new D.RunProperties() { Language = "en-US", Dirty = false },
                                        new D.Text() { Text = existingSlideNote + "Value Updated" }),
                                    new D.EndParagraphRunProperties() { Language = "en-US", Dirty = false }))
                                ))),
                    new ColorMapOverride(new D.MasterColorMapping()));

                notesSlidePart1.NotesSlide = notesSlide;
            }
        }

        /// <summary>
        /// Generate a new uid, 
        /// </summary>
        /// <param name="existingUids"></param>
        /// <param name="iteration"></param>
        /// <returns></returns>
        private static string GenerateUID(List<string> existingUids, int iteration = 0) {
            string newUid = GenerateUrlSafeToken();
            if (existingUids.Contains(newUid)) {
                if(iteration > 1000) {
                    throw new Exception("Could not generate a new uid!");
                }
                return GenerateUID(existingUids, ++iteration);
            }
            existingUids.Add(newUid);
            return "UID:" + newUid;
        }

        /// <summary>
        /// Generates a url safe token and returns it.
        /// </summary>
        /// <param name="length">the length of the token in byte</param>
        /// <returns>The token</returns>
        private static string GenerateUrlSafeToken(int length = 16) {
            byte[] key = new byte[length];
            RNGCryptoServiceProvider.Create().GetBytes(key);

            return Convert.ToBase64String(key).TrimEnd('=').Replace('+', '-').Replace('/', '_');
        }
    }
}
