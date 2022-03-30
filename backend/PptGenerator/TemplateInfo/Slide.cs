using System;
using System.Collections.Generic;
using System.Text;

namespace PptGenerator.TemplateInfo {
    class Slide {
        private string _relationshipId;
        private string _uid;
        private uint _position;
        private string _title;
        private bool _isHidden;
        private List<String> _placeholders;

        public string RelationshipId { get => _relationshipId; set => _relationshipId = value; }
        public string Uid { get => _uid; set => _uid = value; }
        public uint Position { get => _position; set => _position = value; }
        public bool IsHidden { get => _isHidden; set => _isHidden = value; }
        public string Title { get => _title; set => _title = value; }
        public List<string> Placeholders { get => _placeholders; set => _placeholders = value; }

        /// <summary>
        /// Create an object of class Slide
        /// </summary>
        /// <param name="relationshipId">The relationshipId of the slide</param>
        /// <param name="uid">The uid of the slide</param>
        /// <param name="position">The position in it's presentation</param>
        /// <param name="title">The title of the slide</param>
        /// <param name="isHidden">If the slide is hidden in it's presentation</param>
        /// <param name="placeholders">All placeholders of the slide</param>
        public Slide(string relationshipId, string uid, uint position, string title, bool isHidden = false, List<String> placeholders = null) {
            RelationshipId = relationshipId;
            Uid = uid;
            Position = position;
            Title = title;
            IsHidden = isHidden;
            Placeholders = placeholders == null ? new List<string>() : placeholders;
        }

        public override bool Equals(object obj) {
            if (Uid == null) {
                return obj is Slide slide && 
                    slide.Uid == null && 
                    slide.RelationshipId == RelationshipId;
            } else {
                return obj is Slide slide &&
                       Uid == slide.Uid;
            }
        }

        public override int GetHashCode() {
            return HashCode.Combine(Uid);
        }

        public override string ToString() {
            return $"{Position}: {Uid}, {RelationshipId}";
        }
    }
}
