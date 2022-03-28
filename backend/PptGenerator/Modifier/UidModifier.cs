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
                        Console.WriteLine("notesSlidePart == null");
                        notesSlidePart = slidePart.AddNewPart<NotesSlidePart>(slideId.RelationshipId);
                        notesSlidePart = slidePart.GetPartsOfType<NotesSlidePart>().FirstOrDefault();
                    }

                    Console.WriteLine("notesSlidePart");
                    Console.WriteLine(notesSlidePart);
                    Console.WriteLine(notesSlidePart.NotesSlide);

                    if (notesSlidePart.NotesSlide == null) {
                        notesSlidePart.NotesSlide = createNewNoteSlide(clArg);
                    } else {
                        Shape bestShape = notesSlidePart.NotesSlide.Descendants<Shape>().FirstOrDefault();
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
                                if (bestShape.TextBody.InnerText.ToLower().Contains("uid:")) {
                                    if (bestShape.TextBody.InnerText.ToLower().Contains("uid:")) {
                                        foreach (var paragraph in bestShape.TextBody.Descendants<D.Paragraph>()) {
                                            int uidIndex = paragraph.InnerText.ToLower().IndexOf("uid:");
                                            if (uidIndex >= 0) {
                                                paragraph.RemoveAllChildren();
                                                paragraph.Append(
                                                    new D.Run(
                                                        new D.RunProperties() { Language = "en-US", Dirty = false },
                                                        new D.Text() { Text = "new " + GenerateUID(clArg.ExistingUids) }
                                                    ),
                                                    new D.EndParagraphRunProperties() { Language = "en-US", Dirty = false }
                                                );
                                            }
                                        }
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
                    }

                    presentation.Save();
                    presentationDocument.Close();
                }
            }
        }

        /// <summary>
        /// Create a new NotesSlide with a new UID
        /// </summary>
        /// <param name="clArg">The commandline argument</param>
        /// <returns>A new NotesSlide with a new UID</returns>
        private static NotesSlide createNewNoteSlide(CommandLineArgument clArg) {
            return new NotesSlide(
                new CommonSlideData(
                    new ShapeTree(
                        new NonVisualGroupShapeProperties(
                            new NonVisualDrawingProperties() {
                                Id = (UInt32Value)1U,
                                Name = ""
                            },
                            new NonVisualGroupShapeDrawingProperties(),
                            new ApplicationNonVisualDrawingProperties()
                        ),
                        new GroupShapeProperties(new D.TransformGroup()),
                        new Shape(
                            new NonVisualShapeProperties(
                                new NonVisualDrawingProperties() {
                                    Id = (UInt32Value)2U,
                                    Name = "Slide Image Placeholder 1"
                                },
                                new NonVisualShapeDrawingProperties(
                                    new D.ShapeLocks() {
                                        NoGrouping = true,
                                        NoRotation = true,
                                        NoChangeAspect = true
                                    }
                                ),
                                new ApplicationNonVisualDrawingProperties(
                                    new PlaceholderShape() {
                                        Type = PlaceholderValues.SlideImage
                                    }
                                )
                            ),
                            new ShapeProperties()
                        ),
                        new Shape(
                            new NonVisualShapeProperties(
                                new NonVisualDrawingProperties() {
                                    Id = (UInt32Value)3U,
                                    Name = "Notes Placeholder 2"
                                },
                                new NonVisualShapeDrawingProperties(
                                    new D.ShapeLocks() { NoGrouping = true }
                                ),
                                new ApplicationNonVisualDrawingProperties(
                                    new PlaceholderShape() {
                                        Type = PlaceholderValues.Body,
                                        Index = (UInt32Value)1U
                                    }
                                )
                            ),
                            new ShapeProperties(),
                            new TextBody(
                                new D.BodyProperties(),
                                new D.ListStyle(),
                                new D.Paragraph(
                                    new D.Run(
                                        new D.RunProperties() {
                                            Language = "en-US",
                                            Dirty = false
                                        },
                                        new D.Text() {
                                            Text = GenerateUID(clArg.ExistingUids)
                                        }
                                    ),
                                    new D.EndParagraphRunProperties() {
                                        Language = "en-US",
                                        Dirty = false
                                    }
                                )
                            )
                        )
                    )
                ),
                new ColorMapOverride(new D.MasterColorMapping())
            );
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
                if (iteration > 1000) {
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
