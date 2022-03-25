using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Presentation;
using PptGenerator.CommandLine;
using System;
using System.Collections.Generic;
using System.Linq;
using D = DocumentFormat.OpenXml.Drawing;

namespace PptGenerator.Modifier {
    class UidModifier {

        public static void modifyUids(CommandLineArgument clArg) {
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
                                            new D.Text() { Text = "!!!NEUE UID STEHT HIER!!!" }),
                                        new D.EndParagraphRunProperties() { Language = "en-US", Dirty = false }))
                                    ))),
                        new ColorMapOverride(new D.MasterColorMapping())
                        );

                        /*
                        notesSlidePart.NotesSlide = new NotesSlide(
                            new CommonSlideData(new ShapeTree(
                                new NonVisualGroupShapeProperties(
                                    new NonVisualDrawingProperties() { Id = (UInt32Value)1U, Name = "" },
                                    new NonVisualGroupShapeDrawingProperties(),
                                    new ApplicationNonVisualDrawingProperties()),
                                    new GroupShapeProperties(new D.TransformGroup()),
                                    new Shape(
                                        new NonVisualShapeProperties(
                                        new NonVisualDrawingProperties() { Id = (UInt32Value)2U, Name = "" },
                                        new NonVisualShapeDrawingProperties(new D.ShapeLocks() { NoGrouping = true }),
                                        new ApplicationNonVisualDrawingProperties(new PlaceholderShape())),
                                        new ShapeProperties(),
                                        new TextBody(
                                            new D.BodyProperties(),
                                            new D.ListStyle(),
                                            new D.Paragraph(new D.EndParagraphRunProperties())
                                        )
                                    )
                                )
                            ),
                            new ColorMapOverride(new D.MasterColorMapping())
                        );


                        /*
                        ShapeTree shapeTree = notesSlide.Descendants<DocumentFormat.OpenXml.Presentation.ShapeTree>().FirstOrDefault();
                        Shape shape = new Shape();
                        D.Paragraph para = new D.Paragraph(new D.Text("TestText"), new D.EndParagraphRunProperties());
                        shape.TextBody = new TextBody();
                        shape.TextBody.Append(para);
                        shapeTree.Append(shape);
                        */
                    } else {
                        foreach (Shape shape in notesSlidePart.NotesSlide.Descendants<Shape>()) {

                            if (shape.TextBody == null) {
                                shape.TextBody = new TextBody(new D.Paragraph(
                                    new D.Run(
                                        new D.RunProperties() { Language = "en-US", Dirty = false },
                                        new D.Text() { Text = "!!!NEUE UID STEHT HIER!!!" }
                                    ),
                                    new D.EndParagraphRunProperties() { Language = "en-US", Dirty = false }
                                ));
                            } else {
                                shape.TextBody.Append(new D.Paragraph(
                                    new D.Run(
                                        new D.RunProperties() { Language = "en-US", Dirty = false },
                                        new D.Text() { Text = "!!!NEUE UID STEHT HIER!!!" }
                                    ),
                                    new D.EndParagraphRunProperties() { Language = "en-US", Dirty = false }
                                ));
                                shape.TextBody.Append(

);
                            }


                            foreach (D.Paragraph paragraph in shape.TextBody.Descendants<D.Paragraph>()) {

                                List<D.Text> paragraphs = paragraph.Descendants<D.Text>().ToList();

                                for (int i = 0; i < paragraphs.Count; i++) {
                                    D.Text text = paragraphs[i];
                                    Console.WriteLine("text: " + text.Text);
                                    text.Text += "LOL";
                                }
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
    }
}
