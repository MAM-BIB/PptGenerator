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

        public string RelationshipId { get => _relationshipId; set => _relationshipId = value; }
        public string Uid { get => _uid; set => _uid = value; }
        public uint Position { get => _position; set => _position = value; }
        public bool IsHidden { get => _isHidden; set => _isHidden = value; }
        public string Title { get => _title; set => _title = value; }

        public Slide(string relationshipId, string uid, uint position, string title, bool isHidden = false) {
            RelationshipId = relationshipId;
            Uid = uid;
            Position = position;
            Title = title;
            IsHidden = isHidden;
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
